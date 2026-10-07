/* EBOO WORLD – the only file you edit to change products, links and settings. */
window.EBOO = {
  site: {
    name: "Eboo World",
    tagline: "Digital tools that save you time or money.",
    url: "https://example.com",          // TODO: your own domain (also update sitemap.xml, robots.txt)
    email: "hello@example.com",          // TODO: address on your own domain
    replyTime: "within 2 business days",
    newsletterAction: "",                // TODO: form endpoint (MailerLite, Buttondown...). Empty = falls back to e-mail.
    goatcounter: "",                     // TODO: e.g. "eboo-world" to count "Buy on Etsy" clicks (cookie-free). Empty = off.
    freeSheet: { title: "Free checklist", file: "samples/free-checklist.pdf" } // TODO: add the PDF
  },
  products: [
    {
      slug: "budget-calculator",
      title: "Monthly Budget Calculator (Spreadsheet + PDF Guide)",
      subtitle: "See where your money goes in 15 minutes, with a sheet that does the maths for you.",
      price_eur: 9,
      link_kup: "",          // TODO: paste the exact Etsy listing URL here
      platforma: "Etsy",     // "Etsy" or "Payhip"
      cover: ["#1f6f5c", "#f4c95d"],
      format: "Digital download, PDF + spreadsheet, instant access",
      pages: 24, sheets: 6, print: true,
      contents: ["Quick-start guide", "Income & fixed costs sheet", "Variable spending tracker", "Monthly summary dashboard", "Savings goals planner", "Printable one-page overview"],
      forWho: ["You want a simple monthly overview of your money", "You are comfortable filling in a spreadsheet", "You prefer a printable version"],
      notFor: ["You need accounting or tax software", "You want automatic bank syncing", "You are looking for investment advice"],
      sample: "",            // e.g. "samples/budget-calculator-sample.pdf" (2-3 pages only, never the paid file)
      faq: [
        ["Is this financial advice?", "No. It is a calculation tool. It does not tell you what to do with your money."],
        ["What do I need to open it?", "Any PDF reader, plus Excel, Google Sheets or LibreOffice for the spreadsheet."],
        ["How does the purchase work?", "You buy on Etsy and download the files from your Etsy account. See the Help page."]
      ],
      disclaimer: "finance"
    }
  ]
};
