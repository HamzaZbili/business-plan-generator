import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { NextApiRequest, NextApiResponse } from "next";

interface BusinessPlanRequestBody {
  capital: string;
  description: string;
  steps: string;
  wildCard: string;
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function generatePlan(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured",
      },
    });
    return;
  }

  const { capital, description, steps, wildCard }: BusinessPlanRequestBody =
    req.body;

  if (!capital) {
    res.status(400).json({
      error: {
        message: "Please enter a valid capital amount",
      },
    });
    return;
  }

  if (description.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid business description",
      },
    });
    return;
  }

  if (steps.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter steps taken",
      },
    });
    return;
  }

  if (wildCard.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please complete form",
      },
    });
    return;
  }

  const GPTmessage = [
    { role: "system", content: `You are a business advisor.` },
    {
      role: "user",
      content: buildPrompt(capital, description, steps, wildCard),
    },
    {
      role: "assistant",
      content: `Create a business plan. The business will be based in France`,
    },
  ];

  try {
    let GPT35Turbo = async (message: any) => {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: message,
        temperature: 0.7,
      });
      if (!response.data.choices[0].message) {
        res.status(400).json({
          error: {
            message: "no response from GPT35Turbo",
          },
        });
        return;
      }
      return response.data.choices[0].message.content;
    };
    const response = await GPT35Turbo(GPTmessage);
    res.status(200).json(response);
  } catch (error: any) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function buildPrompt(
  capital: string,
  description: string,
  steps: string,
  wildCard: string
): string {
  return `Create a business plan:
  ${description}.
  I have ${capital} euro in capital.
  I have taken these steps: ${steps}.
  ${wildCard}`;
}
