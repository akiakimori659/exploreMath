import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
あなたは「デジタル参考書・問題集」の専門執筆者です。

【核心ルール】
1. **圧倒的な質と量**: 生成する解説はMarkdown形式で、文字量は「2,000文字以上」書いてください。短すぎる解説は禁止です。
2. **数式の形式**: 数式は必ず **LaTeX形式** ($...$) で記述してください。
   - 良い例: $y = ax^2$
   - 悪い例: y = ax^2
3. **ターゲット別の書き分け**:
   - **「小学1年生」**: ひらがな多用。優しく。
   - **「小学2年生」**: 簡単な漢字。九九や単位。
   - **「小学3年生」**: 割り算、小数、分数。論理的に。
   - **「小学4年生」**: 面積、立体、概数。公式の意味。
   - **「小学5年生」**: 割合、速さ。定義と論理。
   - **「小学6年生」**: 比、文字式。中学数学への接続。
   - **「中学1年生」**: 算数から数学へ。正の数・負の数など概念を丁寧に。
   - **「中学2年生」**: 証明、一次関数。論理性重視。
   - **「中学3年生」**: 受験対策。高度な解説。
   - **「高校数学」**: 定義→定理→証明の流れを遵守。厳密な数式操作。大学入試を意識した深い洞察。
   - **「一般・大学生」**: 定義・証明。厳密な数式。
4. **構成要素**:
   - **導入**: 興味を惹く導入。
   - **解説**: 具体例を用いた詳細な説明。
   - **練習問題**: 最後に必ず「れんしゅうもんだい」を3問と「かいせつ」。
5. **「準備中」は禁止**: 必ず内容を生成する。
`;

// Initialize the client
// NOTE: We assume process.env.API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateLesson(topicTitle: string, gradeContext: string): Promise<string> {
  try {
    const model = "gemini-3-pro-preview"; 

    let prompt = `
    【ターゲット】: ${gradeContext}
    【単元】: ${topicTitle}
    
    この単元の講義テキストを作成してください。
    
    【必須要件】
    1. **文字数は最低でも1000文字を超えてください。** 詳しく、丁寧に解説してください。
    2. **数式はすべてLaTeX形式 ($...$) で出力してください。**
    `;

    // Specific formatting based on grade
    if (gradeContext === "小学1年生") {
        prompt += `
        ・ひらがなをメインに使用。「すうじ」「かたち」。
        ・絵文字（🍎など）を使用。
        ・優しく語りかける口調。
        `;
    } else if (gradeContext === "小学2年生") {
        prompt += `
        ・「cm, L」などの単位や筆算を視覚的に説明。
        ・身近な具体例を多く使う。
        `;
    } else if (gradeContext === "小学3年生") {
        prompt += `
        ・割り算や分数の概念を「分ける」ことから丁寧に。
        ・丁寧語だが、少し論理的に。
        `;
    } else if (gradeContext === "小学4年生") {
        prompt += `
        ・面積や大きな数。公式の「理由」を説明。
        ・図形的な思考を促す。
        `;
    } else if (gradeContext === "小学5年生") {
        prompt += `
        ・割合や速さ。定義を明確に。
        ・「なぜそうなるか」を論理的に1000文字以上で解説。
        `;
    } else if (gradeContext === "小学6年生" || gradeContext.includes("小学6年生（総復習）")) {
        prompt += `
        ・比や文字式。具体的な数から抽象的な概念へ。
        ・中学数学へのつながりを意識。
        ・復習用教材として、6年生にわかりやすく噛み砕いて解説してください。
        ・数式は必ずLaTeX形式。
        `;
    } else if (gradeContext === "中学1年生") {
        prompt += `
        ・算数から数学へ変わり、難易度が一気に上がります。「負の数」「文字式」などの新しい概念を非常に細かく、躓かないように丁寧に解説してください。
        ・「なぜマイナス×マイナスがプラスになるのか？」など、根本的な疑問に答えるようにしてください。
        `;
    } else if (gradeContext === "中学2年生") {
        prompt += `
        ・証明問題や一次関数など、論理的思考力が求められます。「なぜそう言えるのか」を数式と言葉で厳密に説明してください。
        ・連立方程式の解法の意味なども解説してください。
        `;
    } else if (gradeContext === "中学3年生" || gradeContext.includes("中学数学（総復習）")) {
        prompt += `
        ・高校受験を見据えた内容にしてください。
        ・因数分解、平方根、二次関数など高度な内容を、わかりやすく、かつ実践的に解説してください。
        ・試験に出やすいポイントなども補足してください。
        `;
    } else if (gradeContext === "高校数学") {
        prompt += `
        ・大学受験レベルに対応した、高度で厳密な解説を行ってください。
        ・「定義」→「定理」→「証明」→「例題」の流れを意識してください。
        ・数式変形は省略せず、論理の飛躍がないように記述してください。
        ・グラフや図形のイメージもテキストで補足説明してください。
        `;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 2048 }, // Increased thinking budget for quality
        temperature: 0.7,
      },
    });

    return response.text || "かいせつの せいせいに しっぱい しました。 もういちど ためしてね。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        return `エラーが発生しました: ${error.message}\n\nAPIキーが正しく設定されているか確認してください。`;
    }
    return "予期せぬエラーが発生しました。";
  }
}

export async function generateChatResponse(history: {role: 'user'|'model', text: string}[], newMessage: string): Promise<string> {
   try {
    const model = "gemini-3-flash-preview"; 
    const chat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION + "\nユーザーの質問に対して、簡潔かつ的確に答えてください。数式はLaTeX形式を使用してください。"
        },
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
        }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "応答できませんでした。";

   } catch (error) {
       console.error("Chat Error:", error);
       return "エラーが発生しました。";
   }
}