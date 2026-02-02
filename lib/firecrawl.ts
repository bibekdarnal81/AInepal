// This is a stub for Firecrawl functionality
// Implement proper Firecrawl integration when API keys are available

export const firecrawl = {
    scrape: async (url: string, options: { formats: string[] }) => {
        console.log(`Stub scraping ${url} with formats ${options.formats}`);
        return {
            markdown: `Mocked markdown content for ${url}`,
        };
    },
};
