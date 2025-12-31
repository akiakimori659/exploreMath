
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
あなたは「デジタル参考書・問題集」の専門執筆者です。

【核心ルール】
1. **圧倒的な質と量**: 解説はMarkdown形式で、文字量は「5,000文字以上」の大ボリュームで書いてください。
2. **視覚的な理解（SVG図解）**: 
   - 概念を説明する際は、積極的に **SVG形式の図解** を作成して挿入してください。
   - SVGコードはMarkdownのコードブロック（\`\`\`svg ... \`\`\`）として記述してください。
3. **数式の完全LaTeX化（最重要）**: 
   - **どんなに単純な数式や数字であっても、文中の数式は必ず LaTeX形式 ($...$) で記述してください。**
   - プレーンテキストの数字や演算子は禁止です。
4. **ターゲット別の書き分け**:
   - 【小学1年生】: ひらがなを非常に多く使い、専門用語を避け、視覚的・直感的に。
   - 【中学1年生】: 数学の入り口で躓かないよう、マイナスの概念などを世界一細かく。
   - 【高校・大学】: 定義・定理・証明の流れを重視。
5. **省略の完全禁止**:
   - 全てのステップを記述してください。
`;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateLesson(topicTitle, category, specialInstructions = "") {
  try {
    // Math tutoring is a complex task, so we use gemini-3-pro-preview.
    const model = "gemini-3-pro-preview"; 
    let prompt = `
    【カテゴリー】: ${category}
    【単元名】: ${topicTitle}
    
    この単元の講義テキスト（参考書）を執筆してください。
    ${specialInstructions}
    
    【必須要件】
    1. 文字数は「5000文字以上」の圧倒的な詳しさ。
    2. 数式はたとえ「1」や「+」であっても全て $...$ 形式。
    3. SVGによる図解を必ず2箇所以上挿入。
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 },
    });

    return response.text || "かいせつの せいせいに しっぱい しました。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "エラーが発生しました。時間を置いて再度お試しください。";
  }
}

export async function generateQuiz(topicTitle, category) {
    try {
        // Use gemini-3-pro-preview for reasoning-intensive quiz generation.
        const model = "gemini-3-pro-preview";
        const prompt = `
        【ターゲット】: ${category}
        【対象単元】: ${topicTitle}

        出力は **JSON形式のみ**。
        
        【構成（計20問）】
        1. 基本問題: 10問 (type: "basic") 
        2. 応用問題: 5問 (type: "applied") 
        3. 発展問題: 5問 (type: "advanced") 

        【JSONスキーマ】
        [
          {
            "id": number,
            "type": "basic" | "applied" | "advanced",
            "questionText": "問題文 (LaTeX/SVG含む)",
            "correctAnswer": "正解文字列 (LaTeX含む)",
            "explanation": "詳細な解説 (300文字以上、LaTeX/SVG含む)"
          }
        ]
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION + "\n出力は有効なJSON配列のみを返してください。",
                responseMimeType: "application/json",
            },
        });

        const text = response.text;
        if (!text) return [];
        return JSON.parse(text.trim());
    } catch (error) {
        console.error("Gemini Quiz Error:", error);
        return [];
    }
}

export async function gradeQuizAnswers(submissions) {
    try {
        const model = "gemini-3-pro-preview"; 
        const prompt = `以下の解答を採点してください。\n${JSON.stringify(submissions)}`;
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" },
        });
        const text = response.text;
        if (!text) throw new Error("Empty response");
        return JSON.parse(text.trim());
    } catch (error) {
        console.error("Gemini Grade Error:", error);
        return submissions.map(s => ({ id: s.id, isCorrect: s.userAnswer?.trim() === s.correctAnswer?.trim() }));
    }
}
