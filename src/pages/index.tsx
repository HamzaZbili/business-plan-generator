import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState } from "react";

export default function Home() {
  const [capitalInput, setCapitalInput] = useState<number | "">("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [steps, setSteps] = useState<string>("");

  const [result, setResult] = useState<string>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
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

      setResult(data.result);
      // console.log(result);
      setCapitalInput(0);
      setDescriptionInput("");
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
        <form onSubmit={onSubmit}>
          <label>
            Write a short description of the business you would like to create?
            <textarea
              name="description"
              placeholder="Enter your business description"
              className={styles.description}
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
            />
          </label>
          <label>
            How much capital do you currently have in euros?
            <br />
            <input
              type="number"
              min={0}
              name="capital"
              value={capitalInput}
              onChange={(e) => setCapitalInput(parseInt(e.target.value))}
            />
            €
          </label>
          <br />
          <label>
            What steps have you already taken?
            <textarea
              name="steps"
              placeholder="Enter progress"
              className={styles.steps}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />
          </label>
          <br />
          <input type="submit" value="Generate business plan" />
        </form>
        {isLoading && <div className={styles.loading}>creating plan</div>}
        <div
          className={styles.result}
          dangerouslySetInnerHTML={{
            __html: result?.replace(/\n/g, "<br>") ?? "",
          }}
        ></div>
      </main>
    </>
  );
}
