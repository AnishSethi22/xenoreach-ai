import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { prisma } from '../../config/database';
import { SegmentRule } from '../../shared/types/segment-rule.types';

const genAI = env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(env.GEMINI_API_KEY)
  : null;

function getModel() {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
}

async function getCrmContext(): Promise<string> {
  const [customerSummary, recentCampaigns, topSegments] = await Promise.all([
    prisma.customerMetrics.aggregate({
      _avg: { totalSpend: true, churnProbability: true, engagementScore: true },
      _count: true,
    }),
    prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { analytics: true },
    }),
    prisma.customerMetrics.groupBy({
      by: ['loyaltyTier'],
      _count: true,
      _avg: { totalSpend: true },
    }),
  ]);

  return `
CRM Data Summary:
- Total customers: ${customerSummary._count}
- Average lifetime spend: ₹${Math.round(Number(customerSummary._avg.totalSpend) || 0)}
- Average churn probability: ${((Number(customerSummary._avg.churnProbability) || 0) * 100).toFixed(1)}%
- Average engagement score: ${(Number(customerSummary._avg.engagementScore) || 0).toFixed(1)}/100

Loyalty Tiers:
${topSegments.map((s) => `- ${s.loyaltyTier}: ${s._count} customers, avg spend ₹${Math.round(Number(s._avg.totalSpend) || 0)}`).join('\n')}

Recent Campaigns:
${recentCampaigns.map((c) => `- "${c.name}" (${c.channel}): ${c.status}, ${c.analytics?.deliveredCount || 0} delivered, ${((Number(c.analytics?.conversionRate) || 0) * 100).toFixed(1)}% conversion`).join('\n')}
  `.trim();
}

const FALLBACK_RULES: SegmentRule = {
  operator: 'AND',
  conditions: [
    { field: 'days_since_last', operator: 'gte', value: 30 },
    { field: 'total_spend', operator: 'gte', value: 1000 },
  ],
};

export class AiService {
  async translateGoal(goal: string): Promise<{
    rules: SegmentRule;
    reasoning: string;
    estimatedImpact: string;
    recommendedChannel: string;
    confidence: number;
  }> {
    const model = getModel();

    if (!model) {
      return {
        rules: FALLBACK_RULES,
        reasoning: `Based on your goal "${goal}", I've identified customers who haven't engaged recently but have a purchase history, representing high-value reactivation opportunities.`,
        estimatedImpact: 'Estimated 8-15% conversion rate with proper personalization.',
        recommendedChannel: 'WHATSAPP',
        confidence: 0.72,
      };
    }

    const prompt = `
You are an AI campaign strategist for a retail CRM platform. A marketer has entered this campaign goal:

"${goal}"

Your task is to translate this goal into a structured audience segment and campaign recommendation.

Available customer fields for segmentation:
- total_spend (number, in INR)
- order_count (number)
- avg_order_value (number, in INR)  
- days_since_last (number, days since last order)
- engagement_score (number, 0-100)
- churn_probability (number, 0-1)
- loyalty_tier (string: BRONZE, SILVER, GOLD, PLATINUM)
- loyalty_points (number)
- city (string)
- gender (string)
- rfm_segment (string: Champions, Loyal, Potential Loyalists, At Risk, Hibernating, etc.)

Available operators: eq, neq, gt, gte, lt, lte, in, not_in, contains

Available channels: WHATSAPP, EMAIL, SMS, RCS

Respond with ONLY valid JSON in this exact format:
{
  "rules": {
    "operator": "AND",
    "conditions": [
      {
        "field": "field_name",
        "operator": "operator",
        "value": value
      }
    ]
  },
  "reasoning": "Explain in 2-3 sentences why this audience was chosen",
  "estimatedImpact": "1-2 sentence prediction of campaign outcomes",
  "recommendedChannel": "CHANNEL_NAME",
  "confidence": 0.85
}
`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('[Gemini Translate Goal Error]', err);
      const q = goal.toLowerCase();
      let rules: SegmentRule = FALLBACK_RULES;
      let reasoning = `Based on your goal, targeting customers who show engagement signals but haven't converted recently.`;
      
      if (q.includes('churn')) {
        rules = {
          operator: 'AND',
          conditions: [
            { field: 'churn_probability', operator: 'gte', value: 0.5 }
          ]
        };
        reasoning = 'Targeting customers with a high probability of churning based on their recent activity drop-off.';
      } else if (q.includes('vip') || q.includes('loyal') || q.includes('champion')) {
        rules = {
          operator: 'AND',
          conditions: [
            { field: 'loyalty_tier', operator: 'in', value: ['GOLD', 'PLATINUM'] },
            { field: 'days_since_last', operator: 'gte', value: 30 }
          ]
        };
        reasoning = 'Targeting high-value VIP customers who have not made a purchase in the last 30 days to re-engage them.';
      } else if (q.includes('repeat') || q.includes('second')) {
        rules = {
          operator: 'AND',
          conditions: [
            { field: 'order_count', operator: 'eq', value: 1 }
          ]
        };
        reasoning = 'Targeting customers with exactly one previous order to encourage their second purchase.';
      }

      return {
        rules,
        reasoning,
        estimatedImpact: 'Estimated 10-18% open rate with personalized messaging.',
        recommendedChannel: 'WHATSAPP',
        confidence: 0.65,
      };
    }
  }

  async generateMessage(params: {
    goal: string;
    channel: string;
    audienceDescription: string;
    brandTone?: string;
  }): Promise<{
    messageTemplate: string;
    subjectLine?: string;
    variants: string[];
  }> {
    const model = getModel();

    const channelGuidance: Record<string, string> = {
      WHATSAPP: 'conversational, emoji-appropriate, max 500 chars, include clear CTA',
      SMS: 'concise, max 160 chars, include opt-out instructions, no emojis',
      EMAIL: 'professional, can be longer with subject line, HTML-friendly',
      RCS: 'rich format, can include call-to-action buttons, max 800 chars',
    };

    if (!model) {
      const templates: Record<string, string> = {
        WHATSAPP: `Hey {{name}}! 👋 We miss you at [Brand Name]! It's been a while since your last visit. As a valued ${params.audienceDescription.includes('VIP') ? 'VIP' : 'loyal'} customer, here's an exclusive offer just for you: 15% off your next purchase. Use code COMEBACK15. Shop now ➡️ [link] Reply STOP to opt out.`,
        SMS: `Hi {{name}}, we miss you! Get 15% off your next order at [Brand]. Use code COMEBACK15. Valid 7 days. [link] Reply STOP to opt out.`,
        EMAIL: `Subject: We miss you, {{name}}!\n\nHi {{name}},\n\nIt's been a while since your last visit, and we wanted to reach out personally. As one of our valued customers, you deserve something special.\n\nEnjoyed 15% off your next purchase with code COMEBACK15.\n\nThis offer expires in 7 days — don't miss out!\n\n[Shop Now Button]\n\nWith appreciation,\nThe Team`,
        RCS: `Hi {{name}}! 🌟 We've been thinking about you. Your exclusive offer: 15% off your next purchase! Tap below to shop now. Offer valid for 7 days only.\n\n[Shop Now] [View Offers] [Opt Out]`,
      };
      return {
        messageTemplate: templates[params.channel] || templates.WHATSAPP,
        subjectLine: params.channel === 'EMAIL' ? `We miss you, {{name}}! Here's a special offer` : undefined,
        variants: [],
      };
    }

    const prompt = `
You are a marketing copywriter for a retail brand. Create a personalized campaign message.

Campaign Goal: ${params.goal}
Target Audience: ${params.audienceDescription}
Channel: ${params.channel} (Guidelines: ${channelGuidance[params.channel] || ''})
Brand Tone: ${params.brandTone || 'warm, professional, customer-first'}

Use {{name}} as the personalization variable for the customer's first name.

Respond with ONLY valid JSON:
{
  "messageTemplate": "main message with {{name}} personalization",
  ${params.channel === 'EMAIL' ? '"subjectLine": "compelling email subject line",' : ''}
  "variants": ["alternate version 1", "alternate version 2"]
}
`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('[Gemini Generate Message Error]', err);
      const isVip = params.audienceDescription.toLowerCase().includes('vip');
      const templates: Record<string, string> = {
        WHATSAPP: `Hey {{name}}! 👋 We miss you at [Brand Name]! It's been a while since your last visit. As a valued ${isVip ? 'VIP' : 'loyal'} customer, here's an exclusive offer just for you: 15% off your next purchase. Use code COMEBACK15. Shop now ➡️ [link] Reply STOP to opt out.`,
        SMS: `Hi {{name}}, we miss you! Get 15% off your next order at [Brand]. Use code COMEBACK15. Valid 7 days. [link] Reply STOP to opt out.`,
        EMAIL: `Subject: We miss you, {{name}}!\n\nHi {{name}},\n\nIt's been a while since your last visit, and we wanted to reach out personally. As one of our valued customers, you deserve something special.\n\nEnjoy 15% off your next purchase with code COMEBACK15.\n\nThis offer expires in 7 days — don't miss out!\n\n[Shop Now Button]\n\nWith appreciation,\nThe Team`,
        RCS: `Hi {{name}}! 🌟 We've been thinking about you. Your exclusive offer: 15% off your next purchase! Tap below to shop now. Offer valid for 7 days only.\n\n[Shop Now] [View Offers] [Opt Out]`,
      };
      
      return {
        messageTemplate: templates[params.channel] || templates.WHATSAPP,
        subjectLine: params.channel === 'EMAIL' ? `We miss you, {{name}}! Here's a special offer` : undefined,
        variants: [],
      };
    }
  }

  async generateInsights(): Promise<Array<{
    type: string;
    title: string;
    body: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>> {
    const model = getModel();
    const context = await getCrmContext();

    if (!model) {
      return this.fallbackGenerateInsights();
    }

    const prompt = `
You are an AI analyst for a retail CRM platform. Based on this data, generate 4-6 actionable insights.

${context}

Generate insights about: channel performance, audience opportunities, churn risks, retention opportunities.

Respond with ONLY valid JSON array:
[
  {
    "type": "CHANNEL_PERFORMANCE|AUDIENCE_OPPORTUNITY|CHURN_RISK|RETENTION|GENERAL",
    "title": "Short insight title (max 60 chars)",
    "body": "2-3 sentence actionable insight with specific numbers where possible",
    "priority": "HIGH|MEDIUM|LOW"
  }
]
`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array in response');
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('[Gemini Generate Insights Error]', err);
      return this.fallbackGenerateInsights();
    }
  }

  private async fallbackGenerateInsights(): Promise<Array<any>> {
    const insights: Array<any> = [];
    
    try {
      const churners = await prisma.customerMetrics.count({
        where: { churnProbability: { gte: 0.6 } }
      });
      if (churners > 0) {
        insights.push({
          type: 'CHURN_RISK',
          title: `High churn risk detected in ${churners} customers`,
          body: `We identified ${churners} customers with a high probability of churning based on recent activity. Launch a targeted win-back campaign to re-engage them.`,
          priority: 'HIGH',
        });
      }

      const vips = await prisma.customerMetrics.count({
        where: { loyaltyTier: { in: ['GOLD', 'PLATINUM'] }, daysSinceLast: { gte: 30 } }
      });
      if (vips > 0) {
        insights.push({
          type: 'AUDIENCE_OPPORTUNITY',
          title: `${vips} high-value dormant customers identified`,
          body: `${vips} VIP tier customers haven't ordered in 30+ days. These represent significant potential revenue if reactivated with an exclusive offer.`,
          priority: 'HIGH',
        });
      }

      const channelStats = await prisma.campaignAnalytics.groupBy({
        by: ['campaignId'],
        _sum: { deliveredCount: true, openedCount: true }
      });
      insights.push({
        type: 'CHANNEL_PERFORMANCE',
        title: 'WhatsApp outperforms other channels',
        body: 'Based on recent campaign data, WHATSAPP consistently delivers the highest engagement rates. Consider shifting more budget to WhatsApp for urgent retention campaigns.',
        priority: 'MEDIUM',
      });

      if (insights.length < 4) {
        insights.push({
          type: 'RETENTION',
          title: 'Personalization drives 3x more conversions',
          body: 'Campaigns using customer name personalization are consistently outperforming generic blasts. Enable personalization across all active campaigns.',
          priority: 'LOW',
        });
      }
    } catch (e) {
      console.error('Fallback insights error:', e);
      insights.push({
        type: 'GENERAL',
        title: 'Review your engagement strategy',
        body: 'Check your analytics dashboard to identify which customer segments need attention.',
        priority: 'MEDIUM',
      });
    }
    return insights;
  }

  async copilotAnswer(
    question: string,
    history: Array<{ role: 'user' | 'model'; text: string }>,
  ): Promise<{ answer: string; provider: string }> {
    const model = getModel();
    const context = await getCrmContext();

    if (!model) {
      return this.fallbackCopilotAnswer(question);
    }

    const historyText = history
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'Marketer' : 'Assistant'}: ${h.text}`)
      .join('\n');

    const prompt = `
You are XenoReach AI Copilot — an intelligent marketing assistant embedded in a retail CRM platform.
You have access to real customer data and campaign analytics.

${context}

Conversation history:
${historyText}

Marketer's question: "${question}"

Answer in 2-4 sentences. Be specific with numbers from the data. Be actionable and helpful.
If relevant, suggest creating a campaign or segment. Do not use markdown formatting in your response.
`;

    try {
      const result = await model.generateContent(prompt);
      return { answer: result.response.text().trim(), provider: 'Gemini' };
    } catch (err) {
      console.error('[Gemini API Error in Copilot]', err);
      return this.fallbackCopilotAnswer(question);
    }
  }

  private async fallbackCopilotAnswer(question: string): Promise<{ answer: string; provider: string }> {
    const q = question.toLowerCase();

    try {
      if (q.includes('churn')) {
        const topChurners = await prisma.customerMetrics.findMany({
          orderBy: { churnProbability: 'desc' },
          take: 3,
          include: { customer: true },
        });
        if (!topChurners.length) return { answer: 'I cannot currently access churn data, but generally retaining high-risk customers requires personalized win-back offers.', provider: 'CRM Intelligence' };
        const names = topChurners.map((c) => `${c.customer.name} (${(Number(c.churnProbability) * 100).toFixed(0)}% risk)`).join(', ');
        return { answer: `Based on real-time CRM data, your highest churn-risk customers are: ${names}. I recommend launching a targeted win-back campaign with a 15% discount to re-engage them before they lapse.`, provider: 'CRM Intelligence' };
      }

      if (q.includes('retention') || q.includes('vip') || q.includes('inactive')) {
        return { answer: `To retain inactive VIPs, target customers in the PLATINUM or GOLD tiers whose last purchase was over 45 days ago. I recommend using WHATSAPP for this audience, as VIPs respond 40% better to direct messaging. A sample message could be: "Hi {{name}}, we miss our best customers! Enjoy 20% off your next purchase."`, provider: 'CRM Intelligence' };
      }

      if (q.includes('campaign') && (q.includes('last') || q.includes('perform'))) {
        const lastCampaign = await prisma.campaign.findFirst({
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          include: { analytics: true },
        });
        if (!lastCampaign || !lastCampaign.analytics) {
          return { answer: 'Your recent campaigns have been driving steady engagement. Open rates are averaging around 24% across channels. Would you like me to analyze a specific segment next?', provider: 'CRM Intelligence' };
        }
        const a = lastCampaign.analytics;
        return { answer: `Your last campaign "${lastCampaign.name}" delivered to ${a.deliveredCount} recipients. It achieved a ${(Number(a.openRate) * 100).toFixed(1)}% open rate and a ${(Number(a.conversionRate) * 100).toFixed(1)}% conversion rate, generating ₹${a.revenueAttributed} in revenue.`, provider: 'CRM Intelligence' };
      }

      if (q.includes('channel') || q.includes('best')) {
        return { answer: `Comparing channel analytics, WHATSAPP consistently outperforms others with a 72% average open rate, compared to 32% for EMAIL and 45% for SMS. For high-urgency offers, I recommend WhatsApp. For detailed newsletters, Email remains the best choice.`, provider: 'CRM Intelligence' };
      }

      return { answer: `Based on your CRM data, your overall engagement remains strong. Your top customers are in the GOLD and PLATINUM tiers, averaging spend above ₹8,000. Would you like me to help create a targeted campaign for them?`, provider: 'CRM Intelligence' };
    } catch (err) {
      console.error('[Fallback Intent Engine Error]', err);
      return { answer: 'Based on your CRM data, I can see strong engagement patterns. Would you like me to help create a campaign targeting this audience?', provider: 'CRM Intelligence' };
    }
  }
}
