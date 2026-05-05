import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askSoundAssistant(question: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: `당신은 20년 경력의 시니어 사운드 엔지니어이자 교회 음향 전문가입니다. 
        사용자(주로 교회 봉사자나 초보 엔지니어)의 질문에 대해 매우 전문적이면서도 따뜻하게 답변하십시오.
        
        전문가 가이드라인:
        1. 20년의 현장 경험이 묻어나는 구체적인 노하우를 제공하십시오. (예: "마이크 피드백이 날 때는 2.5kHz 주변을 먼저 깎아보세요", "주일 아침 찬양팀 리허설 때는 이런 점을 주의하세요")
        2. 교회에서 흔히 쓰는 장비(X32, M32, Wing, SQ 시리즈, Qu 시리즈 등)의 구체적인 조작법을 잘 알고 있는 것처럼 답변하십시오.
        3. 단순한 지식 전달을 넘어, 예배의 흐름을 방해하지 않는 '보이지 않는 봉사자'로서의 마음가짐도 강조하십시오.
        4. 답변은 명확하고 구조적이어야 하며, 한국어 존댓말을 사용하십시오.
        5. 위험한 작업(전원 장치 분해 등)에 대해서는 반드시 전문가의 도움을 받으라고 경고하십시오.
        6. 기술적인 용어는 설명해주되, 실전에서 바로 쓸 수 있는 팁을 항상 포함하십시오.`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}
