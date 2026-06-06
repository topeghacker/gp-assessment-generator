const fs = require('fs');

const db = [
  // CCSS Math
  {
    program: 'American', framework: 'Common Core (CCSS)', subject: 'Mathematics',
    domains: [
      {
        domain: 'Algebra', grades: ['Grade 8', 'Grade 9', 'Grade 10'],
        standards: [
          { code: 'CCSS.Math.A-REI.1', desc: 'Explain each step in solving a simple equation.', cog: 'Understand' },
          { code: 'CCSS.Math.A-REI.2', desc: 'Solve simple rational and radical equations in one variable.', cog: 'Apply' },
          { code: 'CCSS.Math.A-REI.3', desc: 'Solve linear equations and inequalities in one variable.', cog: 'Apply' },
          { code: 'CCSS.Math.A-REI.4', desc: 'Solve quadratic equations in one variable.', cog: 'Apply' }
        ]
      },
      {
        domain: 'Geometry', grades: ['Grade 9', 'Grade 10', 'Grade 11'],
        standards: [
          { code: 'CCSS.Math.G-CO.1', desc: 'Know precise definitions of angle, circle, perpendicular line.', cog: 'Remember' },
          { code: 'CCSS.Math.G-CO.2', desc: 'Represent transformations in the plane.', cog: 'Understand' },
          { code: 'CCSS.Math.G-CO.3', desc: 'Given a rectangle, parallelogram, trapezoid, or regular polygon, describe the rotations and reflections that carry it onto itself.', cog: 'Analyze' }
        ]
      },
      {
        domain: 'Functions', grades: ['Grade 10', 'Grade 11', 'Grade 12'],
        standards: [
          { code: 'CCSS.Math.F-IF.1', desc: 'Understand that a function from one set to another assigns to each element of the domain exactly one element of the range.', cog: 'Understand' },
          { code: 'CCSS.Math.F-IF.2', desc: 'Use function notation, evaluate functions for inputs in their domains.', cog: 'Apply' }
        ]
      }
    ]
  },
  // CCSS ELA
  {
    program: 'American', framework: 'Common Core (CCSS)', subject: 'English Language Arts',
    domains: [
      {
        domain: 'Reading: Literature', grades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
        standards: [
          { code: 'CCSS.ELA.RL.1', desc: 'Cite strong and thorough textual evidence to support analysis of what the text says explicitly.', cog: 'Analyze' },
          { code: 'CCSS.ELA.RL.2', desc: 'Determine a theme or central idea of a text and analyze in detail its development.', cog: 'Analyze' }
        ]
      },
      {
        domain: 'Writing', grades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
        standards: [
          { code: 'CCSS.ELA.W.1', desc: 'Write arguments to support claims in an analysis of substantive topics or texts.', cog: 'Create' },
          { code: 'CCSS.ELA.W.2', desc: 'Write informative/explanatory texts to examine and convey complex ideas.', cog: 'Create' }
        ]
      }
    ]
  },
  // NGSS Life Science
  {
    program: 'American', framework: 'Next Gen Science (NGSS)', subject: 'Life Science',
    domains: [
      {
        domain: 'From Molecules to Organisms', grades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
        standards: [
          { code: 'NGSS.HS-LS1-1', desc: 'Construct an explanation based on evidence for how the structure of DNA determines the structure of proteins.', cog: 'Analyze' },
          { code: 'NGSS.HS-LS1-2', desc: 'Develop and use a model to illustrate the hierarchical organization of interacting systems.', cog: 'Apply' }
        ]
      },
      {
        domain: 'Ecosystems', grades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
        standards: [
          { code: 'NGSS.HS-LS2-1', desc: 'Use mathematical and/or computational representations to support explanations of factors that affect carrying capacity.', cog: 'Evaluate' },
          { code: 'NGSS.HS-LS2-2', desc: 'Use mathematical representations to support claims for the cycling of matter and flow of energy among organisms.', cog: 'Analyze' }
        ]
      }
    ]
  },
  // AERO Mathematics
  {
    program: 'American', framework: 'AERO Standards', subject: 'Mathematics',
    domains: [
      {
        domain: 'Number and Operations', grades: ['Grade 4', 'Grade 5', 'Grade 6'],
        standards: [
          { code: 'AERO.Math.NO.1', desc: 'Compute fluently with multi-digit numbers and find common factors and multiples.', cog: 'Apply' },
          { code: 'AERO.Math.NO.2', desc: 'Apply and extend previous understandings of multiplication and division to divide fractions by fractions.', cog: 'Apply' }
        ]
      },
      {
        domain: 'Algebraic Thinking', grades: ['Grade 7', 'Grade 8'],
        standards: [
          { code: 'AERO.Math.AT.1', desc: 'Analyze proportional relationships and use them to solve real-world and mathematical problems.', cog: 'Analyze' },
          { code: 'AERO.Math.AT.2', desc: 'Apply and extend previous understandings of operations with fractions to add, subtract, multiply, and divide rational numbers.', cog: 'Apply' }
        ]
      }
    ]
  },
  // AERO ELA
  {
    program: 'American', framework: 'AERO Standards', subject: 'English Language Arts',
    domains: [
      {
        domain: 'Reading for Information', grades: ['Grade 6', 'Grade 7', 'Grade 8'],
        standards: [
          { code: 'AERO.ELA.RI.1', desc: 'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.', cog: 'Analyze' },
          { code: 'AERO.ELA.RI.2', desc: 'Determine a central idea of a text and how it is conveyed through particular details.', cog: 'Analyze' }
        ]
      }
    ]
  },
  // AP Biology
  {
    program: 'American', framework: 'AP (Advanced Placement)', subject: 'Biology',
    domains: [
      {
        domain: 'Chemistry of Life', grades: ['Grade 11', 'Grade 12'],
        standards: [
          { code: 'AP.Bio.1', desc: 'Explain how the properties of water result from its polarity and hydrogen bonding.', cog: 'Understand' },
          { code: 'AP.Bio.2', desc: 'Describe the composition of macromolecules required by living organisms.', cog: 'Understand' }
        ]
      },
      {
        domain: 'Cell Structure and Function', grades: ['Grade 11', 'Grade 12'],
        standards: [
          { code: 'AP.Bio.4', desc: 'Describe the structure and/or function of subcellular components and organelles.', cog: 'Understand' },
          { code: 'AP.Bio.5', desc: 'Explain how subcellular components and organelles contribute to the function of the cell.', cog: 'Analyze' }
        ]
      }
    ]
  },
  {
      program: 'American', framework: 'AP (Advanced Placement)', subject: 'Chemistry',
      domains: [
          {
              domain: 'Atomic Structure and Properties', grades: ['Grade 11', 'Grade 12'],
              standards: [
                  { code: 'AP.Chem.1', desc: 'Describe the structure of the atom and the quantization of electron energy.', cog: 'Understand' },
                  { code: 'AP.Chem.2', desc: 'Explain the relationship between the macroscopic properties of a substance and the microscopic structure.', cog: 'Analyze' }
              ]
          },
          {
              domain: 'Chemical Reactions and Kinetics', grades: ['Grade 11', 'Grade 12'],
              standards: [
                  { code: 'AP.Chem.3', desc: 'Represent chemical reactions with balanced chemical equations.', cog: 'Apply' },
                  { code: 'AP.Chem.8', desc: 'Determine the rate law and rate constant for a reaction from experimental data.', cog: 'Apply' }
              ]
          }
      ]
  },
  // Cambridge IGCSE Math
  {
    program: 'British', framework: 'Cambridge IGCSE', subject: 'Mathematics',
    domains: [
      {
        domain: 'Number', grades: ['Year 10', 'Year 11'],
        standards: [
          { code: 'CAM.IGCSE.Math.N1', desc: 'Identify and use natural numbers, integers, prime numbers, square numbers, common factors and common multiples.', cog: 'Understand' },
          { code: 'CAM.IGCSE.Math.N2', desc: 'Calculate with squares, square roots, cubes and cube roots.', cog: 'Apply' }
        ]
      },
      {
        domain: 'Algebra and Graphs', grades: ['Year 10', 'Year 11'],
        standards: [
          { code: 'CAM.IGCSE.Math.A1', desc: 'Use letters to express generalised numbers and express basic arithmetic processes algebraically.', cog: 'Apply' },
          { code: 'CAM.IGCSE.Math.A2', desc: 'Solve linear and quadratic equations in one unknown.', cog: 'Apply' }
        ]
      }
    ]
  },
  // Cambridge AS & A Level Math
  {
    program: 'British', framework: 'Cambridge AS & A Level', subject: 'Mathematics',
    domains: [
      {
        domain: 'Pure Mathematics', grades: ['Year 12', 'Year 13'],
        standards: [
          { code: 'CAM.ALevel.Math.P1', desc: 'Understand the concept of a function, and identify its domain and range.', cog: 'Understand' },
          { code: 'CAM.ALevel.Math.P2', desc: 'Differentiate and integrate combinations of polynomial, exponential, logarithmic and trigonometric functions.', cog: 'Apply' }
        ]
      },
      {
        domain: 'Mechanics', grades: ['Year 12', 'Year 13'],
        standards: [
          { code: 'CAM.ALevel.Math.M1', desc: 'Use kinematics for motion in a straight line with constant acceleration.', cog: 'Apply' },
          { code: 'CAM.ALevel.Math.M2', desc: 'Analyze forces and equilibrium.', cog: 'Analyze' }
        ]
      }
    ]
  },
  // Cambridge IGCSE Science
  {
    program: 'British', framework: 'Cambridge IGCSE', subject: 'Science',
    domains: [
      {
        domain: 'Biology Core', grades: ['Year 10', 'Year 11'],
        standards: [
          { code: 'CAM.IGCSE.Sci.B1', desc: 'Describe the characteristics of living organisms.', cog: 'Understand' },
          { code: 'CAM.IGCSE.Sci.B2', desc: 'Understand cell structure and organization.', cog: 'Understand' }
        ]
      },
      {
        domain: 'Chemistry Core', grades: ['Year 10', 'Year 11'],
        standards: [
          { code: 'CAM.IGCSE.Sci.C1', desc: 'Describe the differences between elements, mixtures and compounds.', cog: 'Understand' },
          { code: 'CAM.IGCSE.Sci.C2', desc: 'Understand the particulate nature of matter.', cog: 'Understand' }
        ]
      }
    ]
  },
  // IB MYP Math
  {
    program: 'IB', framework: 'MYP', subject: 'Mathematics',
    domains: [
      {
        domain: 'Criterion A: Knowing and understanding', grades: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
        standards: [
          { code: 'IB.MYP.Math.A.1', desc: 'Select appropriate mathematics when solving problems in both familiar and unfamiliar situations.', cog: 'Apply' },
          { code: 'IB.MYP.Math.A.2', desc: 'Apply the selected mathematics successfully when solving problems.', cog: 'Apply' }
        ]
      },
      {
        domain: 'Criterion B: Investigating patterns', grades: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
        standards: [
          { code: 'IB.MYP.Math.B.1', desc: 'Select and apply mathematical problem-solving techniques to discover complex patterns.', cog: 'Analyze' },
          { code: 'IB.MYP.Math.B.2', desc: 'Describe patterns as general rules consistent with findings.', cog: 'Create' }
        ]
      },
      {
        domain: 'Criterion C: Communicating', grades: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
        standards: [
          { code: 'IB.MYP.Math.C.1', desc: 'Use appropriate mathematical language in both oral and written explanations.', cog: 'Understand' }
        ]
      },
      {
        domain: 'Criterion D: Applying mathematics in real-life contexts', grades: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
        standards: [
          { code: 'IB.MYP.Math.D.1', desc: 'Identify relevant elements of authentic real-life situations.', cog: 'Understand' }
        ]
      }
    ]
  },
  // IB DP Math
  {
    program: 'IB', framework: 'DP', subject: 'Mathematics',
    domains: [
      {
        domain: 'Number and algebra', grades: ['Grade 11', 'Grade 12'],
        standards: [
          { code: 'IB.DP.Math.NA.1', desc: 'Evaluate exponents and logarithms, and apply laws of exponents and logarithms.', cog: 'Apply' },
          { code: 'IB.DP.Math.NA.2', desc: 'Solve algebraic equations and inequalities.', cog: 'Apply' }
        ]
      },
      {
        domain: 'Functions', grades: ['Grade 11', 'Grade 12'],
        standards: [
          { code: 'IB.DP.Math.F.1', desc: 'Analyze properties of different types of functions and their graphs.', cog: 'Analyze' },
          { code: 'IB.DP.Math.F.2', desc: 'Determine composite and inverse functions.', cog: 'Apply' }
        ]
      }
    ]
  },
  // IB PYP Math
  {
    program: 'IB', framework: 'PYP', subject: 'Mathematics',
    domains: [
      {
        domain: 'Data handling', grades: ['Grade 4', 'Grade 5'],
        standards: [
          { code: 'IB.PYP.Math.DH.1', desc: 'Collect, organize and display data in charts and graphs.', cog: 'Apply' },
          { code: 'IB.PYP.Math.DH.2', desc: 'Interpret data to answer questions.', cog: 'Analyze' }
        ]
      },
      {
        domain: 'Measurement', grades: ['Grade 4', 'Grade 5'],
        standards: [
          { code: 'IB.PYP.Math.M.1', desc: 'Estimate and measure objects using standard units of measurement.', cog: 'Apply' },
          { code: 'IB.PYP.Math.M.2', desc: 'Calculate perimeter and area of 2D shapes.', cog: 'Apply' }
        ]
      }
    ]
  }
];

const jsString = "const STANDARDS_DB = " + JSON.stringify(db, null, 4) + ";";

const getterString = `
        function getStandardsForCurrentSetup() {
            if(!state.setup) return [];
            const prog = state.setup.program;
            const fw = state.setup.framework;
            const subj = state.setup.subject;

            let matches = STANDARDS_DB.filter(entry => entry.program === prog && (entry.framework === fw || fw.includes(entry.framework) || entry.framework.includes(fw)));
            let subjectMatches = matches.filter(entry => entry.subject === subj || subj.includes(entry.subject) || entry.subject.includes(subj));

            if (subjectMatches.length === 0 && matches.length > 0) {
                subjectMatches = [matches[0]]; 
            }

            if (subjectMatches.length === 0) {
                return [
                    { id: 'FB.1', code: 'GEN.1', desc: 'Demonstrate general understanding of foundational concepts.', cog: 'Understand' },
                    { id: 'FB.2', code: 'GEN.2', desc: 'Apply subject specific critical thinking to varied contexts.', cog: 'Apply' }
                ];
            }

            const standards = [];
            subjectMatches.forEach((match, matchIdx) => {
                if (match.domains) {
                     match.domains.forEach((dom, domIdx) => {
                         // Filter by grade if grade is tracked in setup, and grades array exists
                         if (dom.grades && dom.grades.length > 0 && state.setup.grade && !dom.grades.includes(state.setup.grade)) {
                             // We can optionally filter here. But returning all allows users more flexibility.
                         }
                         
                         dom.standards.forEach((std, i) => {
                             standards.push({
                                 id: (std.code + '-' + matchIdx + '-' + domIdx + '-' + i).replace(/\\s/g, ''),
                                 code: std.code,
                                 desc: \`[\${dom.domain}] \${std.desc}\`,
                                 cog: std.cog || 'Apply'
                             });
                         });
                     });
                } else if (match.standards) {
                    match.standards.forEach((std, i) => {
                        standards.push({
                            id: (std.code + '-' + matchIdx + '-' + i).replace(/\\s/g, ''),
                            code: std.code,
                            desc: std.desc,
                            cog: std.cog || 'Apply'
                        });
                    });
                }
            });

            return standards;
        }
`;

const indexFile = fs.readFileSync('index.html', 'utf8');

const regex = /const STANDARDS_DB = \[[^]*?function getStandardsForCurrentSetup\(\) \{[^]*?return standards;\n        \}/;

const replaced = indexFile.replace(regex, jsString + "\n" + getterString);
fs.writeFileSync('index.html', replaced);
