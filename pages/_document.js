import Document, { Html, Head, Main, NextScript } from 'next/document'

const InjectScript = () => {
  let codeToRunOnClient = `
    (function() {
      if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    })()
  `

  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />
}

class MyDocument extends Document {
  
  render() {
    return (
      <Html>
        <Head />
        <body>
          <InjectScript />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument