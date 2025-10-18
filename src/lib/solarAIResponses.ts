/**
 * Simulated AI responses for solar system questions
 * 
 * This module provides simulated AI responses for various solar-related topics
 * to enhance the Solar Assistant experience in both English and Arabic.
 */

import { SolarSystem, SolarPanel, SolarPanelHealth } from '@/types/solarTypes';

// Helper function to get the proper response based on language and query
export function generateSolarAIResponse(userMessage: string, previousMessages: any[], language: string = 'en'): string {
  const query = userMessage.toLowerCase();
  const hasArabicChars = /[\u0600-\u06FF]/.test(query); // Detect Arabic characters in the prompt
  const isArabic = language === 'ar' || hasArabicChars;
  
  // English keywords
  const panelTypeKeywordsEn = ['panel type', 'panel types', 'monocrystalline', 'polycrystalline', 'thin film'];
  const efficiencyKeywordsEn = ['efficiency', 'most efficient', 'performance'];
  const maintenanceKeywordsEn = ['maintenance', 'clean', 'maintain', 'care'];
  const batteryKeywordsEn = ['battery', 'batteries', 'storage'];
  const costKeywordsEn = ['cost', 'price', 'expensive', 'cheap'];
  const calculatorKeywordsEn = ['calculate', 'calculator', 'size', 'how many', 'system size'];
  const installationKeywordsEn = ['install', 'installation', 'setup', 'mounting'];
  const inverterKeywordsEn = ['inverter', 'converter'];
  const lifespanKeywordsEn = ['lifespan', 'warranty', 'how long', 'last'];
  const offGridKeywordsEn = ['off-grid', 'grid tie', 'standalone'];
  // Add wiring keywords in English
  const wiringKeywordsEn = ['connect', 'connecting', 'wiring', 'wire', 'connection', 'setup', 'amp', 'amps', 'watt', 'watts'];
  const seriesKeywordsEn = ['series', 'in series', 'series connection'];
  const parallelKeywordsEn = ['parallel', 'in parallel', 'parallel connection'];
  const mathTriggersEn = ['calculate', 'calculation', 'what is', 'solve', 'math', 'result'];
  
  // Arabic keywords
  const panelTypeKeywordsAr = ['نوع اللوح', 'أنواع الألواح', 'أحادي البلورية', 'متعدد البلورية', 'الفيلم الرقيق'];
  const efficiencyKeywordsAr = ['كفاءة', 'أكثر كفاءة', 'أداء'];
  const maintenanceKeywordsAr = ['صيانة', 'تنظيف', 'الحفاظ', 'العناية'];
  const batteryKeywordsAr = ['بطارية', 'بطاريات', 'تخزين', 'امبير'];
  const costKeywordsAr = ['تكلفة', 'سعر', 'مكلف', 'رخيص'];
  const calculatorKeywordsAr = ['حساب', 'آلة حاسبة', 'حجم', 'كم عدد', 'حجم النظام'];
  const installationKeywordsAr = ['تركيب', 'تثبيت', 'إعداد'];
  const inverterKeywordsAr = ['عاكس', 'محول'];
  const lifespanKeywordsAr = ['عمر', 'ضمان', 'كم يستمر', 'يدوم'];
  const offGridKeywordsAr = ['خارج الشبكة', 'متصل بالشبكة', 'مستقل'];
  // Add wiring keywords in Arabic
  const seriesKeywordsAr = ['التوصيل على التوالي', 'على التوالي', 'متسلسل'];
  const parallelKeywordsAr = ['التوصيل على التوازي', 'على التوازي', 'متوازي'];
  const mathTriggersAr = ['احسب', 'ما هو', 'كم يساوي', 'النتيجة', 'حساب', 'معادلة'];
  const wiringKeywordsAr = ['اشبك', 'توصيل', 'اوصل', 'شبك', 'وصلة', 'توصيلات', 'خليتين', 'خلية', 'وات', 'امبير'];
  
  // Check keywords in the appropriate language
  const panelTypeKeywords = isArabic ? panelTypeKeywordsAr : panelTypeKeywordsEn;
  const efficiencyKeywords = isArabic ? efficiencyKeywordsAr : efficiencyKeywordsEn;
  const maintenanceKeywords = isArabic ? maintenanceKeywordsAr : maintenanceKeywordsEn;
  const batteryKeywords = isArabic ? batteryKeywordsAr : batteryKeywordsEn;
  const costKeywords = isArabic ? costKeywordsAr : costKeywordsEn;
  const calculatorKeywords = isArabic ? calculatorKeywordsAr : calculatorKeywordsEn;
  const installationKeywords = isArabic ? installationKeywordsAr : installationKeywordsEn;
  const inverterKeywords = isArabic ? inverterKeywordsAr : inverterKeywordsEn;
  const lifespanKeywords = isArabic ? lifespanKeywordsAr : lifespanKeywordsEn;
  const offGridKeywords = isArabic ? offGridKeywordsAr : offGridKeywordsEn;
  const wiringKeywords = isArabic ? wiringKeywordsAr : wiringKeywordsEn;
  const seriesKeywords = isArabic ? seriesKeywordsAr : seriesKeywordsEn;
  const parallelKeywords = isArabic ? parallelKeywordsAr : parallelKeywordsEn;
  const mathTriggers = isArabic ? mathTriggersAr : mathTriggersEn;

  const greetingKeywordsEn = ['hello', 'hi', 'hi there', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'];
  const greetingKeywordsAr = ['مرحبا', 'مرحباً', 'اهلا', 'أهلاً', 'أهلا وسهلا', 'السلام عليكم', 'صباح الخير', 'مساء الخير'];
  const greetingKeywords = isArabic ? greetingKeywordsAr : greetingKeywordsEn;

  const sanitizedQuery = query.replace(/[^a-z0-9\s\u0600-\u06FF]/g, ' ').trim();
  const sanitizedWords = sanitizedQuery ? sanitizedQuery.split(/\s+/).filter(Boolean) : [];
  const containsGreeting = greetingKeywords.some((keyword) => sanitizedQuery.includes(keyword));
  const hasTopicHint = /(panel|battery|volt|amp|watt|system|solar|storage|install|maintain|cost|لوح|بطاري|بطارية|فولت|أمبير|تركيب|تكلفة)/u.test(sanitizedQuery);

  if (containsGreeting && (sanitizedWords.length <= 4 || !hasTopicHint)) {
    return getGreetingResponse(isArabic, previousMessages);
  }

  // Check if query includes any keywords from the arrays
  const includesAny = (arr: string[]) => arr.some(keyword => query.includes(keyword));

  const wattageMatches = Array.from(query.matchAll(/(\d+(?:\.\d+)?)\s*(?:w|watts?)/g)).map(match => parseFloat(match[1]));
  const mentionsSeries = seriesKeywords.some(keyword => query.includes(keyword));
  const mentionsParallel = parallelKeywords.some(keyword => query.includes(keyword));

  if (wattageMatches.length >= 2 && mentionsSeries) {
    const sortedWatts = [...wattageMatches].sort((a, b) => b - a);
    const largest = sortedWatts[0];
    const smallest = sortedWatts[sortedWatts.length - 1];
    const largestLabel = Number.isFinite(largest) ? Math.round(largest) : wattageMatches[0];
    const smallestLabel = Number.isFinite(smallest) ? Math.round(smallest) : wattageMatches[wattageMatches.length - 1];

    if (isArabic) {
      return `عند توصيل لوحة ${largestLabel} واط مع لوحة ${smallestLabel} واط على التوالي، يرتفع الجهد لكن التيار يبقى محدوداً باللوحة الأصغر. لذلك سيكون إنتاج السلسلة قريباً من قدرة ${smallestLabel} واط، ولن تتمكن لوحة ${largestLabel} واط من الوصول لقدرتها الاسمية. استخدم ألواحاً متطابقة في السلسلة نفسها، أو ضع كل لوحة على مدخل MPPT مستقل، أو وصّلها على التوازي إذا كان المتحكم يسمح بالتيار المتجمع.`;
    }

    return `When you wire ${largestLabel} W and ${smallestLabel} W panels in series, the voltages add but the string current is capped by the smaller panel. That keeps total power close to the ${smallestLabel} W module, so the ${largestLabel} W panel never delivers its rated output. Use matching panels in one series string, separate MPPT inputs, or a parallel connection (if your controller can handle the combined current).`;
  }

  if (wattageMatches.length >= 2 && mentionsParallel) {
    const sortedWatts = [...wattageMatches].sort((a, b) => b - a);
    const largest = sortedWatts[0];
    const smallest = sortedWatts[sortedWatts.length - 1];
    const largestLabel = Number.isFinite(largest) ? Math.round(largest) : wattageMatches[0];
    const smallestLabel = Number.isFinite(smallest) ? Math.round(smallest) : wattageMatches[wattageMatches.length - 1];
    const combined = Math.round(wattageMatches.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0));

    if (isArabic) {
      return `عند توصيل الألواح على التوازي يبقى الجهد ثابتاً بينما يتجمع التيار. يمكن لكل لوحة ${largestLabel} واط و${smallestLabel} واط أن تعمل أقرب إلى قدرتها الاسمية إذا كان الجهد متطابقاً، لكن عليك التأكد من أن المتحكم يتحمل تياراً مساوياً للمجموع (حوالي ${combined} واط على نفس الجهد). استخدم منصهرات أو مفاتيح حماية لكل فرع لتأمين النظام.`;
    }

    return `In a parallel connection the voltage stays the same and the currents add. A ${largestLabel} W panel and a ${smallestLabel} W panel can each run closer to their own power if their voltages match, but your charge controller must handle the combined current (roughly ${combined} W at the array voltage). Add fuses or breakers on each branch and keep panel specs within the controller limits.`;
  }

  let mathExpression: string | null = null;
  const mathPromptEn = query.match(/(?:what\s+is|calculate|solve|result\s+of)\s+([0-9\.\s\+\-\*\/\(\)]+)/);
  if (mathPromptEn) {
    mathExpression = mathPromptEn[1];
  } else if (isArabic) {
    const mathPromptAr = query.match(/(?:كم|ما\s+هو|احسب)\s+([0-9\.\s\+\-\*\/\(\)]+)/);
    if (mathPromptAr) {
      mathExpression = mathPromptAr[1];
    }
  }

  const simpleMathPattern = /^[0-9\.\s\+\-\*\/\(\)]+$/;
  if (!mathExpression && (mathTriggers.some(keyword => query.includes(keyword)) || simpleMathPattern.test(query.trim()))) {
    if (simpleMathPattern.test(query.trim())) {
      mathExpression = query.trim();
    }
  }

  if (mathExpression) {
    const sanitizedExpression = mathExpression.replace(/[^0-9+\-*/().\s]/g, '');
    const normalizedExpression = sanitizedExpression.replace(/\s+/g, ' ').trim();

    if (/[0-9]/.test(sanitizedExpression)) {
      let result: number | null = null;
      try {
        const value = Function(`return (${sanitizedExpression});`)();
        if (typeof value === 'number' && Number.isFinite(value)) {
          result = value;
        }
      } catch (error) {
        result = null;
      }

      if (result !== null) {
        const formattedResult = Number.isInteger(result) ? result.toString() : Number(result.toFixed(4)).toString();
        if (isArabic) {
          return `نتيجة الحساب: ${normalizedExpression || sanitizedExpression} = ${formattedResult}. هذه المساعدة السريعة تغطي العمليات الأساسية فقط (+، -، *، /)، لذلك تحقق دائماً من حسابات النظام مع بيانات المتحكم وخسائر الأسلاك.`;
        }
        return `Calculation result: ${normalizedExpression || sanitizedExpression} = ${formattedResult}. This quick helper only covers basic +, -, *, / math, so double-check solar sizing against controller limits and expected efficiency losses.`;
      }

      if (isArabic) {
        return 'لم أستطع حساب هذا التعبير. استخدم أرقاماً وعلامات + - * / فقط أو جزّئ السؤال إلى خطوات أبسط.';
      }
      return 'I could not evaluate that expression. Use only numbers and + - * /, or break the problem into smaller steps.';
    }
  }
  
  // Check for keywords to determine response type
  if (includesAny(wiringKeywords)) {
    // Prioritize wiring response, as it's a common and specific question
    return getWiringResponse(isArabic, query);
  }
  else if (includesAny(panelTypeKeywords)) {
    return getPanelTypeResponse(isArabic);
  } 
  else if (includesAny(efficiencyKeywords)) {
    return getEfficiencyResponse(isArabic);
  }
  else if (includesAny(maintenanceKeywords)) {
    return getMaintenanceResponse(isArabic);
  }
  else if (includesAny(batteryKeywords)) {
    return getBatteryStorageResponse(isArabic);
  }
  else if (includesAny(costKeywords)) {
    return getCostResponse(isArabic);
  }
  else if (includesAny(calculatorKeywords)) {
    return getCalculatorResponse(isArabic);
  }
  else if (includesAny(installationKeywords)) {
    return getInstallationResponse(isArabic);
  }
  else if (includesAny(inverterKeywords)) {
    return getInverterResponse(isArabic);
  }
  else if (includesAny(lifespanKeywords)) {
    return getLifespanResponse(isArabic);
  }
  else if (includesAny(offGridKeywords)) {
    return getOffGridResponse(isArabic);
  }
  
  // Default response if no specific keywords match
  return getDefaultResponse(isArabic);
}

function getGreetingResponse(isArabic: boolean = false, previousMessages: any[] = []): string {
  const hasPreviousUser = Array.isArray(previousMessages) && previousMessages.some((msg) => msg?.role === 'user');

  if (isArabic) {
    if (hasPreviousUser) {
      return `مرحباً بك من جديد! أخبرني أين توقفت أو ما التحديث الجديد وسأرشدك للخطوة التالية فوراً.`;
    }

    return `أهلاً! أنا مساعد الطاقة الشمسية ويمكنني مساعدتك في حساب المقاسات، مقارنة الألواح، أو حل مشاكل التوصيل. شاركني ما تعمل عليه لنبدأ.`;
  }

  if (hasPreviousUser) {
    return `Welcome back! Let me know what you'd like to focus on next: panel sizing, wiring checks, storage planning, or incentives, and I'll pick up from there.`;
  }

  return `Hi there! I'm ready to help with solar questions like panel sizing, wiring options, storage planning, or incentives. Tell me what you're working on and we'll tackle it together.`;
}

function getPanelTypeResponse(isArabic: boolean = false): string {
  if (isArabic) {
    return `هناك أربعة أنواع رئيسية من ألواح الطاقة الشمسية:

1. **ألواح أحادية البلورية** - مصنوعة من بلورة سيليكون واحدة، وهي الألواح الأكثر كفاءة (18-22٪) والأطول عمراً. لها لون أسود مميز وهي مثالية للتركيبات ذات المساحة المحدودة.

2. **ألواح متعددة البلورية** - مصنوعة من شظايا سيليكون متعددة مصهورة معاً، هذه الألواح الزرقاء أقل كفاءة (15-17٪) ولكنها أكثر اقتصادية. تعمل بشكل جيد في المناخات المعتدلة وتوفر توازناً جيداً بين التكلفة والأداء.

3. **ألواح الفيلم الرقيق** - هذه الألواح المرنة خفيفة الوزن ومتعددة الاستخدامات ولكنها أقل كفاءة (10-13٪). تعمل بشكل أفضل في درجات الحرارة العالية والظل الجزئي، مما يجعلها مناسبة لتطبيقات محددة.

4. **ألواح ثنائية الوجه** - تلتقط ضوء الشمس من كلا الجانبين، مما يزيد من إنتاج الطاقة بنسبة 5-30٪ اعتماداً على التركيب والانعكاسية المحيطة.

أفضل نوع من الألواح لك يعتمد على احتياجاتك الخاصة، وقيود المساحة، والميزانية، وظروف المناخ المحلي.`;
  }
  
  return `There are four main types of solar panels:

1. **Monocrystalline Panels** - Made from single silicon crystal, these are the most efficient (18-22%) and longest-lasting panels. They have a distinctive black color and are ideal for limited space installations.

2. **Polycrystalline Panels** - Made from multiple silicon fragments melted together, these blue panels are less efficient (15-17%) but more affordable. They work well in moderate climates and offer a good balance of cost and performance.

3. **Thin-Film Panels** - These flexible panels are lightweight and versatile but less efficient (10-13%). They perform better in high temperatures and partial shading, making them suitable for specific applications.

4. **Bifacial Panels** - These capture sunlight from both sides, increasing energy production by 5-30% depending on installation and surrounding reflectivity.

The best panel type for you depends on your specific needs, space constraints, budget, and local climate conditions.`;
}

function getEfficiencyResponse(isArabic: boolean = false): string {
  if (isArabic) {
    return `تشير كفاءة الألواح الشمسية إلى مدى فعالية تحويل الألواح لضوء الشمس إلى كهرباء:

• **ألواح ذات أعلى كفاءة**: تتصدر الألواح أحادية البلورية السوق بكفاءة 18-22٪. يمكن للموديلات المتميزة من SunPower وLG وREC أن تصل إلى كفاءة تصل إلى 22.8٪.

• **عوامل الكفاءة**: هناك عدة عوامل تؤثر على الكفاءة في العالم الحقيقي:
  - اتجاه وميل الألواح
  - التظليل من الأشجار أو المباني أو الهياكل الأخرى
  - درجة الحرارة (تفقد الألواح الكفاءة في الحرارة الشديدة)
  - تراكم الغبار أو الأوساخ أو الثلوج
  - العمر (تتدهور الألواح بنسبة 0.5-1٪ سنوياً)

• **تحسين الكفاءة**:
  - تركيب الألواح بزوايا مثالية متجهة نحو الجنوب (في نصف الكرة الشمالي)
  - استخدام المحولات الصغيرة أو محسنات الطاقة لحالات التظليل الجزئي
  - التنظيف والصيانة المنتظمة
  - النظر في أنظمة التتبع للحصول على أقصى إنتاج

• **التكلفة مقابل الكفاءة**: الألواح ذات الكفاءة العالية تكلف أكثر ولكنها تتطلب مساحة أقل. بالنسبة للمناطق ذات المساحات المحدودة على السطح، تكون الألواح ذات الكفاءة العالية أكثر منطقية. إذا لم تكن المساحة مقيدة، فقد توفر الألواح ذات الكفاءة المتوسطة الأكثر اقتصادًا عوائد مالية أفضل.

ما هي الجوانب المحددة للكفاءة التي ترغب في معرفة المزيد عنها؟`;
  }
  
  return `Solar panel efficiency refers to how effectively panels convert sunlight into electricity:

• **Highest Efficiency Panels**: Monocrystalline panels lead the market with 18-22% efficiency. Premium models from SunPower, LG, and REC can reach up to 22.8% efficiency.

• **Efficiency Factors**: Several factors affect real-world efficiency:
  - Panel orientation and tilt
  - Shading from trees, buildings, or other structures
  - Temperature (panels lose efficiency in extreme heat)
  - Dust, dirt, or snow accumulation
  - Age (panels degrade about 0.5-1% annually)

• **Improving Efficiency**:
  - Install panels at optimal angles facing south (northern hemisphere)
  - Use microinverters or power optimizers for partial shading situations
  - Regular cleaning and maintenance
  - Consider tracking systems for maximum production

• **Cost vs. Efficiency**: Higher efficiency panels cost more but require less space. For limited roof areas, high-efficiency panels make more sense. If space isn't constrained, more affordable mid-efficiency panels may provide better financial returns.

What specific aspects of efficiency would you like to know more about?`;
}

function getMaintenanceResponse(): string {
  return `Solar panels are relatively low maintenance, but regular care ensures optimal performance:

**Routine Maintenance Tasks:**

1. **Panel Cleaning** - Clean panels 2-4 times per year with water and a soft brush or sponge. Remove leaves, dirt, bird droppings, and other debris. Early morning or evening is best to avoid cleaning hot panels.

2. **Visual Inspections** - Monthly checks for:
   - Physical damage to panels
   - Loose mountings or connections
   - Signs of water damage or pest infestations
   - Wiring condition (look for cracked insulation)

3. **Performance Monitoring** - Track system output regularly to spot unexpected production drops that might indicate issues.

4. **Vegetation Management** - Trim trees or plants that might grow to cast shadows on your panels.

5. **Snow Removal** - In snowy regions, gently remove heavy snow using a soft brush with an extended handle (never use metal tools).

6. **Professional Inspection** - Have a solar technician conduct a thorough check every 2-3 years to test electrical connections, check inverter performance, and ensure system integrity.

With proper maintenance, solar panels can maintain over 80% of their original efficiency even after 25 years of operation.

Would you like more specific information about cleaning methods or troubleshooting common issues?`;
}

function getBatteryStorageResponse(): string {
  return `Solar battery storage systems allow you to store excess energy for use when the sun isn't shining:

**Common Battery Types:**

1. **Lead-Acid** - Traditional, affordable option ($100-200/kWh)
   • Pros: Low upfront cost, established technology
   • Cons: Shorter lifespan (3-5 years), regular maintenance, lower depth of discharge (50%)

2. **Lithium-Ion** - Most popular modern option ($400-750/kWh)
   • Pros: Long lifespan (10+ years), higher efficiency (95%), deeper discharge (80-90%)
   • Cons: Higher upfront cost, potential thermal runaway concerns

3. **Saltwater** - Emerging technology ($400-500/kWh)
   • Pros: Environmentally friendly, non-toxic, no fire risk
   • Cons: Lower energy density, larger size, limited track record

4. **Flow Batteries** - For larger applications ($500-700/kWh)
   • Pros: Very long lifespan (20+ years), unlimited cycles, full discharge capability
   • Cons: Lower efficiency, larger size, higher complexity

**Sizing Your Battery System:**
Typical home backup requires 10-15 kWh storage capacity. To determine your needs, calculate:
- Average daily electricity usage (from utility bills)
- Critical loads you want to power during outages
- Days of autonomy desired (typically 1-3 days)

**Other Considerations:**
- Cycle life (how many charge/discharge cycles before capacity degrades)
- Warranty (typically 5-15 years depending on battery type)
- Indoor vs. outdoor installation requirements
- Integration with existing solar system

Would you like me to help you calculate the appropriate battery size for your needs?`;
}

function getCostResponse(): string {
  return `Solar system costs vary based on size, quality, and location, but here's a general overview:

**Residential Solar Costs (as of 2023):**

• **System Cost**: $2.50-$3.50 per watt installed (before incentives)
  - Average 6kW system: $15,000-$21,000
  - Average 10kW system: $25,000-$35,000

• **Component Breakdown**:
  - Solar panels: 25-30% of total cost
  - Inverter: 10-15%
  - Mounting hardware: 10%
  - Installation labor: 15-30%
  - Permitting/inspection: 10-15%
  - Balance of system & margin: 15-20%

• **Battery Storage** (optional):
  - Lithium-ion: $7,000-$14,000 for ~10kWh system
  - Lead-acid: $4,000-$8,000 for similar capacity

**Financial Incentives**:
• Federal Investment Tax Credit: 30% of system cost through 2032
• State/local rebates: Varies by location ($500-$5,000+)
• Net metering: Available in many areas (credit for excess energy)
• SREC markets: In some states, earn $10-$400 per MWh produced

**Return on Investment**:
• Typical payback period: 7-12 years (varies by location)
• Expected system lifespan: 25-30+ years
• Lifetime savings: $20,000-$50,000+ (depending on local electricity rates)

**Financing Options**:
• Cash purchase: Highest long-term returns
• Solar loans: Many with $0 down, 2.99-7.99% interest rates
• Lease/PPA: No upfront cost, but lower long-term savings

Would you like more specific cost information based on your location or system size?`;
}

function getCalculatorResponse(): string {
  return `To calculate the right solar system size, we need to consider several factors:

**Step 1: Determine your energy needs**
- Check your electricity bills for monthly kWh usage
- Calculate daily average (monthly kWh ÷ 30)
- For example: 900 kWh/month ÷ 30 = 30 kWh/day

**Step 2: Account for solar production factors**
- Peak sun hours in your location (typically 3-6 hours)
- Panel efficiency (typically 15-22%)
- System losses (inverter, wiring, dust - typically 20-25%)

**Step 3: Calculate system size**
- System size (kW) = Daily energy needs (kWh) ÷ Peak sun hours
- Then add 25% for system losses
- Example: 30 kWh ÷ 5 sun hours × 1.25 = 7.5 kW system

**Step 4: Calculate number of panels**
- Number of panels = System size (W) ÷ Panel wattage
- Example: 7,500W ÷ 350W panels = 22 panels

**Step 5: Consider space requirements**
- Average panel is about 17-20 sq ft
- Example: 22 panels × 20 sq ft = 440 sq ft of roof space

I'd be happy to help you with specific calculations for your situation. You can also use our Solar Calculator tool for a more detailed analysis. Would you like me to walk you through that?`;
}

function getInstallationResponse(): string {
  return `Solar panel installation involves several key steps:

**1. Site Assessment & Planning**
- Roof condition and orientation evaluation
- Shading analysis
- Structural assessment
- Electrical system evaluation
- Permit requirements review

**2. System Design**
- Panel layout and positioning
- Electrical design
- Inverter and equipment selection
- Mounting system selection based on roof type
- Production estimates

**3. Permitting**
- Building permits
- Electrical permits
- Utility interconnection applications
- HOA approvals (if applicable)
- Incentive applications

**4. Installation Process** (typically 1-3 days)
- Mounting hardware installation
- Panel placement and securing
- Electrical wiring and connections
- Inverter and monitoring system installation
- Battery installation (if applicable)

**5. Final Steps**
- Municipal inspection
- Utility meter installation (if grid-connected)
- System activation and testing
- Monitoring setup

**Installation Considerations:**
- Roof orientation: South-facing is optimal in northern hemisphere
- Tilt angle: Generally equal to your latitude for best year-round production
- Shading: Even partial shade can significantly reduce output
- Roof condition: Roofs within 5 years of replacement should be replaced first
- Weather: Installation timing may depend on seasonal considerations

Many homeowners choose professional installation, though DIY is possible for those with electrical and construction experience. Professional installation typically includes permitting assistance, warranty coverage, and support with incentive applications.

Would you like more specific information about the installation process for your situation?`;
}

function getInverterResponse(): string {
  return `Inverters are crucial components that convert DC electricity from solar panels into usable AC electricity for your home:

**Types of Solar Inverters:**

1. **String Inverters**
   - Most common and affordable option
   - All panels connect to one central inverter
   - Pros: Lower cost, simple design, high efficiency (97-98%)
   - Cons: If one panel underperforms, the entire string is affected; limited monitoring

2. **Microinverters**
   - Small inverters attached to each individual panel
   - Pros: Panel-level monitoring, better performance in partial shade, longer warranties (25 years)
   - Cons: Higher cost (20-30% more), more potential failure points

3. **Power Optimizers**
   - Hybrid approach: optimizers on each panel with a string inverter
   - Pros: Panel-level optimization, good shade tolerance, detailed monitoring, moderate cost
   - Cons: Still requires central inverter, slightly more complex

4. **Battery Inverters/Hybrid Inverters**
   - Manage both solar panels and battery storage
   - Pros: Integrated system, seamless battery operation, backup power capability
   - Cons: Higher cost, more complex installation

**Key Inverter Specifications:**
- **Efficiency**: Typically 95-98%
- **Power Rating**: Should match or slightly exceed your solar array capacity
- **Warranty**: 10-25 years depending on type
- **Monitoring Capabilities**: Basic production vs. comprehensive panel-level data
- **Grid-tie functionality**: How it interacts with the utility grid

The best inverter choice depends on your specific needs, budget, shading conditions, and whether you plan to add batteries in the future.

Would you like recommendations for your specific situation?`;
}

function getLifespanResponse(): string {
  return `Solar energy systems are long-term investments with different component lifespans:

**Solar Panels**
- **Average Lifespan**: 25-35 years
- **Performance Warranty**: Typically 25 years, guaranteeing at least 80-85% of original output by year 25
- **Degradation Rate**: 0.5-0.8% per year for quality panels
- **Physical Durability**: Designed to withstand hail, snow, wind (up to specified ratings)

**Inverters**
- **String Inverters**: 10-15 years
- **Microinverters**: 20-25 years
- **Power Optimizers**: 25 years (optimizer), 12 years (inverter)
- **Replacement Cost**: Approximately 10-20% of total system cost

**Batteries** (if installed)
- **Lead-Acid**: 3-7 years (500-1,000 cycles)
- **Lithium-Ion**: 10-15 years (2,000-6,000 cycles)
- **Flow Batteries**: 20+ years (10,000+ cycles)

**Mounting Hardware**
- **Expected Life**: 25+ years
- **Warranty**: Typically 10-20 years
- **Materials**: Typically anodized aluminum or stainless steel for corrosion resistance

**Factors That Affect Lifespan**
- Installation quality
- Climate conditions (extreme temperatures can accelerate degradation)
- Maintenance practices
- Component quality
- Manufacturer reputation

Quality solar panels continue producing electricity even beyond their warranty period, though at gradually reduced efficiency. Many systems installed in the 1980s are still operational today, demonstrating the durability of solar technology.

With proper maintenance and component replacement (primarily inverters), a solar system can provide clean energy for 30+ years.`;
}

function getOffGridResponse(): string {
  return `There are three main types of solar power systems:

**1. Grid-Tied Systems** (Most Common)
- Connected to utility grid
- No batteries needed
- Excess power feeds back to grid (net metering)
- Shuts down during power outages (safety feature)
- Pros: Lowest cost, simple installation, uses grid as "virtual battery"
- Cons: No backup during outages, requires utility approval

**2. Off-Grid Systems** (Completely Independent)
- No connection to utility grid
- Requires battery bank for energy storage
- Often includes backup generator for extended cloudy periods
- Pros: Energy independence, works anywhere, no utility bills
- Cons: Higher cost (2-3× grid-tied), larger battery bank required, more complex

**3. Hybrid/Battery Backup Systems**
- Connected to grid but includes battery storage
- Can operate during grid outages
- Allows for self-consumption and peak-shaving
- Pros: Provides backup power, maximizes self-consumption, may reduce demand charges
- Cons: More expensive than basic grid-tied systems, more complex installation

**Key Considerations for Off-Grid Systems:**
- Daily energy requirements (often requires energy-efficient appliances)
- Battery sizing (typically 2-5 days of autonomy)
- Seasonal sunlight variations
- Backup power sources
- Inverter capacity for peak loads
- Maintenance requirements

Off-grid systems are ideal for remote locations, but hybrid systems have become increasingly popular in areas with unreliable grids or high electricity costs.

Would you like more information about a specific type of system for your needs?`;
}

function getDefaultResponse(isArabic: boolean = false): string {
  if (isArabic) {
    return `شكراً على سؤالك عن الطاقة الشمسية! 

يسعدني تقديم معلومات حول العديد من المواضيع المتعلقة بالطاقة الشمسية، بما في ذلك:

• أنواع وكفاءة الألواح الشمسية
• تحديد حجم وتصميم النظام
• التكاليف والحوافز المالية
• عملية التركيب ومتطلباتها
• خيارات تخزين البطارية
• أفضل ممارسات الصيانة
• أنظمة خارج الشبكة مقابل أنظمة متصلة بالشبكة
• الفوائد البيئية

هل يمكنك من فضلك تقديم المزيد من التفاصيل حول جانب معين من جوانب الطاقة الشمسية الذي تهتم بمعرفة المزيد عنه؟ سيساعدني ذلك على تقديم المعلومات الأكثر صلة لك.`;
  }
  
  return `Thanks for reaching out! I can help with solar panel selection, system sizing, wiring approaches, storage planning, incentives, and more.

Share any details you have: panel wattage, roof space, location, or goals, and I'll tailor the guidance to the next best step for you.`;
}

/**
 * Special function to handle wiring and connection questions
 * This function analyzes the query to provide specific answers about wiring solar panels to batteries
 */
function getWiringResponse(isArabic: boolean = false, query: string): string {
  const mentionsSeries = query.includes('series');

  if (query.includes('660') && query.includes('330') && (mentionsSeries || query.includes('in series'))) {
    if (isArabic) {
      return `توصيل لوح بقدرة 660 واط مع لوح 330 واط على التوالي يعني أن نفس التيار يمر عبر اللوحين. اللوح الأصغر هو الذي يحدد الحد الأقصى للتيار، لذلك سيعمل الزوج تقريباً كما لو أنهما لوحان بقدرة 330 واط مع بعض الفاقد في الطاقة المتاحة من اللوح الأكبر.

لتحافظ على التوصيل بأمان:
- تأكد أن مجموع جهدي Voc و Vmp يقع ضمن حدود منظم الشحن أو العاكس.
- فكّر في التوصيل على التوازي فقط إذا كانت قيم الجهد متقاربة جداً.
- يفضل استخدام متتبع MPPT مستقل أو عاكسات صغيرة لكل لوح حتى لا يختنق اللوح الأكبر.`;
    }

    return `Connecting a 660 W panel with a 330 W panel in series forces both modules to run at the same current. The smaller panel sets the current limit, so the pair behaves almost like two 330 W panels and the extra capacity of the larger module is mostly lost.

To keep things safe:
- Confirm the combined Voc and Vmp stay within your charge controller or inverter limits.
- Parallel wiring is only a good idea if their voltage ratings are very close.
- Separate MPPT inputs or micro-inverters let the larger panel deliver its full output without being throttled.`;
  }

  // Check for specific connection case about 660W panels and 200Ah batteries
  if (query.includes('660') && query.includes('200') && query.includes('امبير')) {
    if (isArabic) {
      return `بالنسبة لتوصيل خليتين شمسية بقدرة 660 وات (13 أمبير لكل واحدة) مع بطاريتين 200 أمبير، إليك الطريقة المناسبة:

**توصيل الألواح الشمسية:**
1. **التوصيل على التوازي**: قم بتوصيل الألواح الشمسية على التوازي (الموجب مع الموجب والسالب مع السالب) لزيادة التيار الإجمالي إلى 26 أمبير مع الحفاظ على نفس الجهد.

**توصيل البطاريات:**
1. **التوصيل على التوازي**: قم بتوصيل البطاريات على التوازي للحصول على سعة إجمالية 400 أمبير-ساعة مع الحفاظ على نفس الجهد (عادة 12 فولت).

**ما يجب إضافته:**
1. **منظم شحن MPPT**: يجب استخدام منظم شحن MPPT بقدرة لا تقل عن 30 أمبير لاستيعاب التيار من الألواح (مع هامش أمان). المنظم MPPT يعطي كفاءة أعلى ويحمي البطاريات من الشحن الزائد.

2. **قواطع وفيوزات**: قم بتركيب فيوزات مناسبة (30 أمبير) بين الألواح والمنظم، وبين المنظم والبطاريات للحماية من الدوائر القصيرة.

3. **أسلاك بمقطع مناسب**: استخدم أسلاك بمقطع لا يقل عن 6-10 ملم² للتوصيلات لتجنب الفقد في الطاقة والحرارة الزائدة.

**ملاحظات هامة:**
- تأكد من توافق جهد الألواح مع منظم الشحن والبطاريات.
- تأكد من تركيب صمام منع الرجوع (دايود) إذا لم يكن مدمجاً في الألواح.
- احرص على عمل التوصيلات في مكان جاف وآمن، وقم بتغطية نقاط التوصيل بعازل مناسب.

هل تحتاج إلى معلومات إضافية حول هذا التركيب؟`;
    } else {
      return `For connecting two 660W solar panels (13A each) with two 200Ah batteries, here's the appropriate method:

**Solar Panel Connection:**
1. **Parallel Connection**: Connect the solar panels in parallel (positive to positive, negative to negative) to increase the total current to 26A while maintaining the same voltage.

**Battery Connection:**
1. **Parallel Connection**: Connect the batteries in parallel for a total capacity of 400Ah while maintaining the same voltage (typically 12V).

**Required Components:**
1. **MPPT Charge Controller**: Use an MPPT charge controller with a capacity of at least 30A to accommodate the current from the panels (with safety margin). The MPPT controller provides higher efficiency and protects batteries from overcharging.

2. **Circuit Breakers and Fuses**: Install appropriate fuses (30A) between the panels and controller, and between the controller and batteries for protection against short circuits.

3. **Appropriate Cable Size**: Use cables with a cross-section of at least 6-10mm² for connections to avoid power loss and excessive heat.

**Important Notes:**
- Ensure compatibility between panel voltage, charge controller, and batteries.
- Make sure to install a blocking diode if not already integrated into the panels.
- Make connections in a dry, safe place and cover connection points with appropriate insulation.

Would you like additional information about this setup?`;
    }
  }

  // Generic response for wiring questions
  if (isArabic) {
    return `فيما يلي إرشادات عامة لتوصيل الألواح الشمسية بالبطاريات:

**خيارات توصيل الألواح الشمسية:**

1. **التوصيل على التوالي**: 
   - يزيد الجهد (الفولت) بينما يبقى التيار (الأمبير) ثابتًا
   - مثال: لوحان 12 فولت/5 أمبير على التوالي = 24 فولت/5 أمبير
   - مناسب عندما تحتاج إلى زيادة الجهد لمطابقة منظم الشحن

2. **التوصيل على التوازي**: 
   - يزيد التيار (الأمبير) بينما يبقى الجهد (الفولت) ثابتًا
   - مثال: لوحان 12 فولت/5 أمبير على التوازي = 12 فولت/10 أمبير
   - مناسب عندما تحتاج إلى زيادة التيار المنتج

**خيارات توصيل البطاريات:**

1. **التوصيل على التوالي**: 
   - يزيد الجهد (الفولت) بينما تبقى السعة (أمبير-ساعة) ثابتة
   - مثال: بطاريتان 12 فولت/100 أمبير-ساعة على التوالي = 24 فولت/100 أمبير-ساعة

2. **التوصيل على التوازي**: 
   - تزيد السعة (أمبير-ساعة) بينما يبقى الجهد (الفولت) ثابتًا
   - مثال: بطاريتان 12 فولت/100 أمبير-ساعة على التوازي = 12 فولت/200 أمبير-ساعة

**المكونات الإلزامية:**

- **منظم الشحن**: ضروري بين الألواح والبطاريات لحماية البطاريات من الشحن الزائد
- **عاكس (إنفرتر)**: لتحويل التيار المستمر (DC) إلى تيار متردد (AC) للأجهزة المنزلية
- **فيوزات وقواطع**: للحماية من التيارات الزائدة والدوائر القصيرة

هل يمكنك تزويدي بمزيد من التفاصيل حول نظامك المحدد؟ مثل جهد (فولت) الألواح والبطاريات، حتى أتمكن من تقديم إرشادات أكثر تحديدًا.`;
  } else {
    return `Here are general guidelines for connecting solar panels to batteries:

**Solar Panel Connection Options:**

1. **Series Connection**: 
   - Increases voltage (Volts) while current (Amps) remains constant
   - Example: Two 12V/5A panels in series = 24V/5A
   - Suitable when you need to increase voltage to match your charge controller

2. **Parallel Connection**: 
   - Increases current (Amps) while voltage (Volts) remains constant
   - Example: Two 12V/5A panels in parallel = 12V/10A
   - Suitable when you need to increase current production

**Battery Connection Options:**

1. **Series Connection**: 
   - Increases voltage (Volts) while capacity (Amp-hours) remains constant
   - Example: Two 12V/100Ah batteries in series = 24V/100Ah

2. **Parallel Connection**: 
   - Increases capacity (Amp-hours) while voltage (Volts) remains constant
   - Example: Two 12V/100Ah batteries in parallel = 12V/200Ah

**Essential Components:**

- **Charge Controller**: Required between panels and batteries to protect batteries from overcharging
- **Inverter**: To convert DC to AC for household appliances
- **Fuses and Circuit Breakers**: For protection against overcurrent and short circuits

Can you provide more details about your specific system? Such as the voltage (Volts) of your panels and batteries, so I can provide more specific guidance.`;
  }
}
