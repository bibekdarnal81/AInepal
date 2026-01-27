// import Script from 'next/script';

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.dataset.theme = theme;
  } catch (e) {
    // no-op
  }
})();
`;

// export function ThemeScript() {
//   return (
//     <Script id="theme-script" strategy="beforeInteractive">
//       {themeScript}
//     </Script>
//   );
// }

export function ThemeScript() {
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}
