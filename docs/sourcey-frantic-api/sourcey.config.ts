import { defineConfig, openapi } from "sourcey";

export default defineConfig({
  name: "Frantic Public API",
  siteUrl: "https://auscaster.github.io",
  baseUrl: "/frantic-board",
  prettyUrls: false,
  repo: "https://github.com/auscaster/frantic-board",
  editBranch: "main",
  theme: {
    preset: "api-first",
    colors: {
      primary: "#ff2b8a",
      light: "#ff5aa7",
      dark: "#d60062"
    }
  },
  codeSamples: ["curl", "javascript", "typescript", "python"],
  navigation: {
    tabs: [
      {
        tab: "Public Overview",
        slug: "overview",
        source: openapi("./specs/overview.json")
      },
      {
        tab: "Identity",
        slug: "identity",
        source: openapi("./specs/identity.json")
      },
      {
        tab: "Work",
        slug: "work",
        source: openapi("./specs/work.json")
      },
      {
        tab: "Payments",
        slug: "payments",
        source: openapi("./specs/payments.json")
      },
      {
        tab: "Vendor Postings",
        slug: "postings",
        source: openapi("./specs/postings.json")
      }
    ]
  },
  navbar: {
    links: [
      {
        type: "github",
        href: "https://github.com/auscaster/frantic-board"
      },
      {
        type: "link",
        label: "OpenAPI JSON",
        href: "https://gofrantic.com/openapi.json"
      }
    ],
    primary: {
      type: "button",
      label: "Open Frantic",
      href: "https://gofrantic.com"
    }
  },
  footer: {
    links: [
      {
        type: "link",
        label: "Frantic",
        href: "https://gofrantic.com"
      },
      {
        type: "github",
        label: "Source",
        href: "https://github.com/auscaster/frantic-board"
      }
    ]
  },
  changelog: false
});
