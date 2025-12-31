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
   - 良い例: 「$1$ つのリンゴと $2$ つのリンゴを足すと $1+2=3$ になります。」
   - 悪い例: 「1つのリンゴと2つのリンゴを足すと 1+2=3 になります。」
4. **ターゲット別の書き分け**:
   - 学年（小学1年生〜大学数学）に合わせて、ひらがなの使用率や漢字の難易度、論理の厳密さを調整してください。
5. **省略の完全禁止**:
   - 九九の表や計算過程など、「...」で省略せずに全て書き出してください。
`;

// Initialize the client
// NOTE: We assume process.env.API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateLesson(topicTitle, gradeContext) {
  try {
    // Use flash model for speed
    const model = "gemini-3-flash-preview"; 

    let prompt = `
    【ターゲット】: ${gradeContext}
    【単元】: ${topicTitle}
    
    この単元の講義テキストを作成してください。
    
    【必須要件】
    1. **文字数は「5000文字以上」書いてください。**
    2. **図解（SVG）を必ず含めてください。**
    3. **数式は、たとえ「1+1」であっても全てLaTeX形式 ($...$) で出力してください。**
    4. **リストやパターンは省略せずに全て書き出してください。**
    `;

    // Specific formatting based on grade
    if (gradeContext.includes("小学")) {
        prompt += `
        ・数字も必ずLaTeX ($1$, $2$...) にしてください。
        ・優しく、視覚的に。
        `;
    } else {
        prompt += `
        ・定義、定理、証明の流れを重視。
        ・数式変形は省略せず記述。
        `;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Flash model doesn't support thinkingConfig significantly or at all like Pro, 
        // but we keep budget 0 to disable it or just rely on default.
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.7,
      },
    });

    return response.text || "かいせつの せいせいに しっぱい しました。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) return `エラー: ${error.message}`;
    return "予期せぬエラーが発生しました。";
  }
}

export async function generateQuiz(topicTitle, gradeContext) {
    try {
        // Use flash model for speed
        const model = "gemini-3-flash-preview";
        
        const prompt = `
        【ターゲット】: ${gradeContext}
        【対象単元（複数可）】: ${topicTitle}

        指定された単元の演習問題セットを作成してください。
        対象単元が複数の場合は、**複数の単元の知識を組み合わせて解く融合問題**を積極的に含めてください。

        出力は **JSON形式のみ** とし、Markdownのコードブロック等は不要です。
        
        【構成（計20問）】
        1. 基本問題: 10問 (type: "basic") - 単元の基礎確認
        2. 応用問題: 5問 (type: "applied") - 複数の概念の組み合わせ
        3. 発展問題: 5問 (type: "advanced") - 深い思考力を問う融合問題

        【要件】
        - 数式は必ずLaTeX形式 ($...$) を使用すること。
        - **図形問題やグラフの問題など、視覚情報が必要な場合は、questionText または explanation フィールド内に SVGコード（\`\`\`svg ... \`\`\`）を積極的に含めてください。**
        
        【JSONスキーマ】
        [
          {
            "id": number, // 1〜20
            "type": "basic" | "applied" | "advanced",
            "questionText": "問題文 (LaTeXおよび必要に応じてSVGコードブロックを含む)",
            "correctAnswer": "正解の文字列 (LaTeX含む)",
            "explanation": "解説 (LaTeXおよび必要に応じてSVGコードブロックを含む、300文字以上)"
          }
        ]
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION + "\n出力は有効なJSON配列のみを返してください。",
                responseMimeType: "application/json",
                temperature: 0.5,
            },
        });

        const jsonStr = response.text;
        if (!jsonStr) throw new Error("No response");

        const questions = JSON.parse(jsonStr);
        return questions;

    } catch (error) {
        console.error("Quiz Gen Error:", error);
        // Fallback or empty array
        return [];
    }
}

export async function gradeQuizAnswers(submissions) {
    try {
        const model = "gemini-3-flash-preview"; 
        
        const prompt = `
        あなたは数学の採点官です。
        以下の「生徒の解答」が「正解」と数学的に等しいか判定してください。

        【判定ルール】
        1. **形式の柔軟性**:
           - プレーンテキストとLaTeX表記は等価とみなす（例: "2" == "$2$"）。
           - 全角・半角の違い、前後の空白は無視する。
        2. **数学的な等価性**:
           - 値が同じなら正解（例: "0.5" == "1/2"、"1000" == "1,000"）。
           - 式の形が違っても数学的に正しい変形なら正解（例: "x=1, y=2" == "y=2, x=1"）。
        3. **部分点なし**: 完全正解のみ true。

        【データ】
        ${JSON.stringify(submissions)}

        【出力】
        JSON配列のみを出力してください。Markdownのコードブロックは不要です。
        [{ "id": number, "isCorrect": boolean }]
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.1, 
            },
        });

        const jsonStr = response.text;
        if (!jsonStr) throw new Error("No response");
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Grading Error:", error);
        // Fallback: simple comparison if AI fails
        return submissions.map(s => ({
            id: s.id,
            isCorrect: s.userAnswer.trim().replace(/\s/g, "") === s.correctAnswer.trim().replace(/\s/g, "")
        }));
    }
}

export async function generateChatResponse(history, newMessage) {
   try {
    const model = "gemini-3-flash-preview"; 
    const chat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION + "\nユーザーの質問に対して、簡潔かつ的確に答えてください。どんなに単純な数字でも数式はLaTeX形式 ($...$) を使用してください。"
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