import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { NextApiRequest, NextApiResponse } from "next";

interface BusinessPlanRequestBody {
  capital: string;
  description: string;
  steps: string;
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function generateBusinessPlan(
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

  const { capital, description, steps }: BusinessPlanRequestBody = req.body;

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

  const GPTmessage = [
    { role: "system", content: `You are a business advisor.` },
    {
      role: "user",
      content: buildPrompt(capital, description, steps),
    },
    {
      role: "assistant",
      content: `Ask me a single relevant question which requires a long answer
        and that can assist you the advisor.`,
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
  steps: string
): string {
  return `${description}.
  I have ${capital} euros.
  I have taken these steps: ${steps}.`;
}
