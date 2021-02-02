import Document, { Html, Head, Main, NextScript } from 'next/document'

const InjectScript = () => {
  let codeToRunOnClient = `
    (function() {
      if (localTheme === "light" || !("theme" in localStorage)) {
        document.documentElement.classList.remove("dark")
      } else {
        document.documentElement.classList.add("dark")
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