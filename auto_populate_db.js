import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

async function main() {
    const html = fs.readFileSync('index.html', 'utf8');
    const regex = /const STANDARDS_DB = (\[[\s\S]*?\]);\s*function getStandardsForCurrentSetup/s;
    const match = html.match(regex);
    if (!match) {
        console.error("Could not find STANDARDS_DB in index.html");
        process.exit(1);
    }

    let db;
    try {
        db = JSON.parse(match[1]);
    } catch (e) {
        console.error("Error parsing STANDARDS_DB:", e);
        process.exit(1);
    }

    const ai = new GoogleGenAI({});

    const targets = db.filter(d => 
        (d.program === 'British' || d.program === 'IB') && 
        d.domains[0] && d.domains[0].domain.startsWith('Foundations of')
    );

    console.log(`Found ${targets.length} missing subjects to fetch.`);

    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        console.log(`Fetching [${i+1}/${targets.length}]: ${target.program} - ${target.framework} - ${target.subject}...`);
        
        const subCode = target.subject.replace(/[^A-Za-z0-9]/g, '').substring(0,3).toUpperCase();
        const shortCode = target.framework.replace(/[^A-Za-z0-9]/g, '').substring(0,4).toUpperCase();
        
        const prompt = `You are a curriculum expert. Retrieve the official educational standards/curriculum objectives for:
Program: ${target.program}
Framework: ${target.framework}
Subject: ${target.subject}

Create 2-3 realistic domains/strands appropriate for this subject and framework. Under each domain, provide 4-5 distinct learning standards with cognitive levels (Remember, Understand, Apply, Analyze, Evaluate, Create).
Ensure the standard codes follow a structured format e.g., ${shortCode}.${subCode}.[number].

Return ONLY a valid JSON object matching this schema:
{
  "domains": [
    {
      "domain": "Domain Name (e.g. Algebra / Core Physics)",
      "standards": [
        { "code": "Short Code", "desc": "Standard Description", "cog": "Cognitive Level" }
      ]
    }
  ]
}
No markdown blocks, just raw JSON.`;

        let success = false;
        let retries = 3;
        while (!success && retries > 0) {
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-1.5-flash',
                    contents: prompt,
                    config: {
                        tools: [{ googleSearch: {} }],
                        temperature: 0.2
                    }
                });
                let text = response.text.trim();
                if (text.startsWith('\`\`\`json')) {
                    text = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
                } else if (text.startsWith('\`\`\`')) {
                    text = text.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
                }
                
                const generated = JSON.parse(text);
                if (generated.domains && Array.isArray(generated.domains)) {
                    // Keep the grades from the original target
                    const originalGrades = target.domains[0].grades;
                    target.domains = generated.domains.map(d => ({
                        domain: d.domain,
                        grades: originalGrades,
                        standards: d.standards
                    }));
                    console.log(`Successfully updated ${target.framework} ${target.subject}`);
                    success = true;
                } else {
                    retries--;
                    console.log(`Invalid JSON schema, retries left: ${retries}`);
                }
            } catch (e) {
                retries--;
                console.error(`Failed to fetch for ${target.framework} ${target.subject}, retries left: ${retries}:`, e.message);
                await new Promise(r => setTimeout(r, 2000));
            }
        }
        
        // Wait 2 seconds to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
    }

    const newHtml = html.replace(regex, `const STANDARDS_DB = ${JSON.stringify(db, null, 4)};\n        function getStandardsForCurrentSetup`);
    fs.writeFileSync('index.html', newHtml, 'utf8');
    console.log("update complete.");
}

main();
