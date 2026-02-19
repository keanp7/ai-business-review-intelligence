import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { GlobalContextProviders } from "./components/_globalContextProviders";
import Page_0 from "./pages/faq.tsx";
import PageLayout_0 from "./pages/faq.pageLayout.tsx";
import Page_1 from "./pages/blog.tsx";
import PageLayout_1 from "./pages/blog.pageLayout.tsx";
import Page_2 from "./pages/about.tsx";
import PageLayout_2 from "./pages/about.pageLayout.tsx";
import Page_3 from "./pages/admin.tsx";
import PageLayout_3 from "./pages/admin.pageLayout.tsx";
import Page_4 from "./pages/login.tsx";
import PageLayout_4 from "./pages/login.pageLayout.tsx";
import Page_5 from "./pages/terms.tsx";
import PageLayout_5 from "./pages/terms.pageLayout.tsx";
import Page_6 from "./pages/_index.tsx";
import PageLayout_6 from "./pages/_index.pageLayout.tsx";
import Page_7 from "./pages/search.tsx";
import PageLayout_7 from "./pages/search.pageLayout.tsx";
import Page_8 from "./pages/pricing.tsx";
import PageLayout_8 from "./pages/pricing.pageLayout.tsx";
import Page_9 from "./pages/privacy.tsx";
import PageLayout_9 from "./pages/privacy.pageLayout.tsx";
import Page_10 from "./pages/reviews.tsx";
import PageLayout_10 from "./pages/reviews.pageLayout.tsx";
import Page_11 from "./pages/add-business.tsx";
import PageLayout_11 from "./pages/add-business.pageLayout.tsx";
import Page_12 from "./pages/blog.$blogId.tsx";
import PageLayout_12 from "./pages/blog.$blogId.pageLayout.tsx";
import Page_13 from "./pages/data-security.tsx";
import PageLayout_13 from "./pages/data-security.pageLayout.tsx";
import Page_14 from "./pages/business.$businessId.tsx";
import PageLayout_14 from "./pages/business.$businessId.pageLayout.tsx";

if (!window.requestIdleCallback) {
  window.requestIdleCallback = (cb) => {
    setTimeout(cb, 1);
  };
}

import "./base.css";

const fileNameToRoute = new Map([["./pages/faq.tsx","/faq"],["./pages/blog.tsx","/blog"],["./pages/about.tsx","/about"],["./pages/admin.tsx","/admin"],["./pages/login.tsx","/login"],["./pages/terms.tsx","/terms"],["./pages/_index.tsx","/"],["./pages/search.tsx","/search"],["./pages/pricing.tsx","/pricing"],["./pages/privacy.tsx","/privacy"],["./pages/reviews.tsx","/reviews"],["./pages/add-business.tsx","/add-business"],["./pages/blog.$blogId.tsx","/blog/:blogId"],["./pages/data-security.tsx","/data-security"],["./pages/business.$businessId.tsx","/business/:businessId"]]);
const fileNameToComponent = new Map([
    ["./pages/faq.tsx", Page_0],
["./pages/blog.tsx", Page_1],
["./pages/about.tsx", Page_2],
["./pages/admin.tsx", Page_3],
["./pages/login.tsx", Page_4],
["./pages/terms.tsx", Page_5],
["./pages/_index.tsx", Page_6],
["./pages/search.tsx", Page_7],
["./pages/pricing.tsx", Page_8],
["./pages/privacy.tsx", Page_9],
["./pages/reviews.tsx", Page_10],
["./pages/add-business.tsx", Page_11],
["./pages/blog.$blogId.tsx", Page_12],
["./pages/data-security.tsx", Page_13],
["./pages/business.$businessId.tsx", Page_14],
  ]);

function makePageRoute(filename: string) {
  const Component = fileNameToComponent.get(filename);
  return <Component />;
}

function toElement({
  trie,
  fileNameToRoute,
  makePageRoute,
}: {
  trie: LayoutTrie;
  fileNameToRoute: Map<string, string>;
  makePageRoute: (filename: string) => React.ReactNode;
}) {
  return [
    ...trie.topLevel.map((filename) => (
      <Route
        key={fileNameToRoute.get(filename)}
        path={fileNameToRoute.get(filename)}
        element={makePageRoute(filename)}
      />
    )),
    ...Array.from(trie.trie.entries()).map(([Component, child], index) => (
      <Route
        key={index}
        element={
          <Component>
            <Outlet />
          </Component>
        }
      >
        {toElement({ trie: child, fileNameToRoute, makePageRoute })}
      </Route>
    )),
  ];
}

type LayoutTrieNode = Map<
  React.ComponentType<{ children: React.ReactNode }>,
  LayoutTrie
>;
type LayoutTrie = { topLevel: string[]; trie: LayoutTrieNode };
function buildLayoutTrie(layouts: {
  [fileName: string]: React.ComponentType<{ children: React.ReactNode }>[];
}): LayoutTrie {
  const result: LayoutTrie = { topLevel: [], trie: new Map() };
  Object.entries(layouts).forEach(([fileName, components]) => {
    let cur: LayoutTrie = result;
    for (const component of components) {
      if (!cur.trie.has(component)) {
        cur.trie.set(component, {
          topLevel: [],
          trie: new Map(),
        });
      }
      cur = cur.trie.get(component)!;
    }
    cur.topLevel.push(fileName);
  });
  return result;
}

function NotFound() {
  return (
    <div>
      <h1>Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>Go back to the <a href="/" style={{ color: 'blue' }}>home page</a>.</p>
    </div>
  );
}

import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollManager() {
  const { pathname, search, hash } = useLocation();
  const navType = useNavigationType(); // "PUSH" | "REPLACE" | "POP"

  useEffect(() => {
    // Back/forward: keep browser-like behavior
    if (navType === "POP") return;

    // Hash links: let the browser scroll to the anchor
    if (hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search, hash, navType]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <GlobalContextProviders>
        <Routes>
          {toElement({ trie: buildLayoutTrie({
"./pages/faq.tsx": PageLayout_0,
"./pages/blog.tsx": PageLayout_1,
"./pages/about.tsx": PageLayout_2,
"./pages/admin.tsx": PageLayout_3,
"./pages/login.tsx": PageLayout_4,
"./pages/terms.tsx": PageLayout_5,
"./pages/_index.tsx": PageLayout_6,
"./pages/search.tsx": PageLayout_7,
"./pages/pricing.tsx": PageLayout_8,
"./pages/privacy.tsx": PageLayout_9,
"./pages/reviews.tsx": PageLayout_10,
"./pages/add-business.tsx": PageLayout_11,
"./pages/blog.$blogId.tsx": PageLayout_12,
"./pages/data-security.tsx": PageLayout_13,
"./pages/business.$businessId.tsx": PageLayout_14,
}), fileNameToRoute, makePageRoute })} 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </GlobalContextProviders>
    </BrowserRouter>
  );
}
