import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState } from "react";

export default function Home() {
  const [capitalInput, setCapitalInput] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [steps, setSteps] = useState<string>("");
  const [wildCard, setWildCard] = useState<string>("");
  const [prompt, setPrompt] = useState<string>();
  const [plan, setPlan] = useState<string>("");

  const [isPromptGenerated, setIsPromptGenerated] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function createPrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/createPrompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          capital: capitalInput,
          description: descriptionInput,
          steps: steps,
        }),
      });
      setIsLoading(false);
      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setPrompt(data.result);
      setIsPromptGenerated(true);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  }

  async function createPlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/generatePlan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          capital: capitalInput,
          description: descriptionInput,
          steps: steps,
          wildCard: wildCard,
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      setIsLoading(false);
      setPlan(data.result);
      setCapitalInput("");
      setDescriptionInput("");
      setSteps("");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <>
      <Head>
        <title>Just Begin Demo</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h3>Request business plan</h3>
        {isPromptGenerated ? (
          <form onSubmit={createPlan}>
            <label>
              {prompt}
              <textarea
                name="wildcard"
                className={styles.descriptionInput}
                value={wildCard}
                onChange={(e) => setWildCard(e.target.value)}
              />
            </label>
            <input type="submit" value="generate plan" />
          </form>
        ) : (
          <form onSubmit={createPrompt}>
            <label>
              Write a short description of the business you would like to
              create?
              <textarea
                name="description"
                placeholder="Enter your business description"
                className={styles.descriptionInput}
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
              />
            </label>
            <label>
              How much capital do you currently have in euros?
              <br />
              <input
                type="number"
                name="capital"
                className={styles.capitalInput}
                value={capitalInput}
                onChange={(e) => setCapitalInput(e.target.value)}
              />
              €
            </label>
            <br />
            <label>
              What steps have you already taken?
              <textarea
                name="steps"
                placeholder="Enter progress"
                className={styles.stepsInput}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
              />
            </label>
            <br />
            <input type="submit" value="next" />
          </form>
        )}
        {isLoading && <div className={styles.loading}>loading</div>}
        <div
          className={styles.result}
          dangerouslySetInnerHTML={{
            __html: plan?.replace(/\n/g, "<br>") ?? "",
          }}
        ></div>
      </main>
    </>
  );
}
