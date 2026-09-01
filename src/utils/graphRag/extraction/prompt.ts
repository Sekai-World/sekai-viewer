import type { IScenarioData } from "../../../types";
import { formatContextAsMarkdown } from "../retrieval";
import type { RetrievedContext } from "../types";

/**
 * Generate system prompt from types
 */
export function generateSystemPrompt(targetLanguage: string): string {
  return `You are extracting structured knowledge from a Project Sekai story for a knowledge graph.

=== CRITICAL REQUIREMENT ===
**Extract entities and their relationships from the story.**
Focus on:
- NEW entities that appear in this story
- UPDATES to existing entities (new relationships, new facts discovered)
- RICH relationship context - describe everything about relationships: history, emotions, conflicts, bonds
  - Examples: "childhood friends who drifted apart", "siblings with tension due to misunderstanding", "bandmates who inspire each other"
- Extract only what you observe in THIS story - don't invent information

=== EXTRACTION ORDER (MANDATORY) ===
Output 'newEntities' array before the detailed entity arrays.

1. **New entities first**: Identify each entity that is new to the existing context and add it to the top-level newEntities array. Each newEntities item must contain exactly two fields: type and identifier. Do not include a name, description, translation, episode ID, fact, or relationship in this first list. type must be one of character, event, term, or group.
2. **Enrich afterwards**: Then populate characters, events, terms, and groups with full details. Include every new entity from newEntities in its matching detailed array, and include an existing entity only when this story adds new information.

newEntities is an identifier-only discovery step, not a replacement for the detailed arrays. Always return it, including when no new entities exist (newEntities: []).

=== EXTRACTION TASK ===
Analyze the story and extract:

1. **Characters**: NEW characters not in the context OR existing characters with new information
   - Provide: identifier (unique, lowercase, e.g., "ichika"), full name, translated name, gender, original text variants
   - Each character has a 'relations' array for character-to-character relationships (undirected)
   - Focus on RICH relationship descriptions in the context field
   - **Relationship changes**: Describe how relationships evolve or change (e.g., "misunderstood each other", "reconciled", "grew distant")
   - **Beyond labels**: Don't just use labels like "siblings" or "bandmates" - describe the actual dynamics, emotions, conflicts, bonds
   - **Original text variants MUST uniquely identify the character**: Include ALL Japanese name variants that appear in the original text. DO NOT include generic terms like "お母さん" (mother), "先輩" (senpai), "弟" (younger brother) - these are not unique identifiers. Only include variants that specifically name THIS character.
     - Good examples: "一歌", "星乃一歌", "いちか", "ホシノイチカ" (all uniquely identify Ichika)
     - Bad examples: "お母さん", "先輩", "彼女" (these could refer to anyone)
   - **Translated names**: Provide an object that maps EVERY originalTextVariants value to its translation in ${targetLanguage}. Each key must exactly match its original text variant.
   - **Virtual singers** (Hatsune Miku, Kagamine Rin, Kagamine Len, Megurine Luka, KAITO, MEIKO): These characters appear in each unit's SEKAI. Use a single identifier per virtual singer (e.g., "miku", "rin", "len"). When describing their relations or involvement, always mention which unit's SEKAI they appear in and how they interact with that unit's members:
     - Leo/need's SEKAI: a school
     - MORE MORE JUMP!'s SEKAI: a stage
     - Vivid BAD SQUAD's SEKAI: a street
     - Wonderlands×Showtime's SEKAI: a theme park
     - 25-ji, Nightcord de.'s SEKAI: an empty world

   Example character (excluding nested relations and facts for clarity):
   {
     "identifier": "ichika",
     "name": "Hoshino Ichika",
     "translatedName": {"一歌": "Ichika", "星乃一歌": "Hoshino Ichika", "いちか": "Ichika", "ホシノイチカ": "Hoshino Ichika"},
     "gender": "female",
     "originalTextVariants": ["一歌", "星乃一歌", "いちか", "ホシノイチカ"],
     "group": "Leo/need",
     "relations": [
       {
         "identifier": "ichika_saki_childhood_friends",
         "target": {"type": "character", "identifier": "saki"},
         "episodeId": 1,
         "context": "childhood friends and bandmates who were separated when Saki was hospitalized"
       }
     ],
     "facts": [
       {
         "identifier": "ichika_plays_guitar",
         "statement": "Ichika plays guitar",
         "description": "She is the lead guitarist and vocalist of Leo/need",
         "episodeId": 1
       }
     ]
   }

2. **Events**: Significant story moments
   - Provide: identifier (unique, lowercase_with_underscores, e.g., "first_performance"), name, description, episode number
   - Each event has an 'involve' array for characters/terms/groups involved in the event
   - Each event has a 'facts' array for statements about the event

   Example event (excluding nested involve and facts for clarity):
   {
     "identifier": "first_band_practice",
     "name": "First Band Practice",
     "description": "Leo/need's first practice session after reuniting, filled with nervousness and hope",
     "episodeId": 3,
     "involve": [
       {
         "identifier": "practice_involves_ichika",
         "target": {"type": "character", "identifier": "ichika"},
         "episodeId": 3,
         "context": "leads the practice session as guitarist and vocalist"
       }
     ],
     "facts": [
       {
         "identifier": "practice_at_school",
         "statement": "The practice takes place at school",
         "description": "They use the music room after classes",
         "episodeId": 3
       }
     ]
   }

3. **Terms**: Concepts, objects, places
   - Provide: identifier (unique, lowercase_with_underscores, e.g., "sekai"), name, original name, description, translated name, episode number
   - DO NOT include music groups/bands as terms - those go in groups array
   - **Original text variants MUST uniquely identify the term**: Include variants that specifically refer to THIS term, not generic words.
     - Good examples for "Leo/need's SEKAI": "レオニのセカイ", "Leo/need's SEKAI", "学校セカイ" (school SEKAI)
     - Bad examples: "セカイ" (just "SEKAI" - too generic, could refer to any unit's SEKAI), "sekai", "世界" (world - too generic)
   - **Translated names**: Provide an object that maps EVERY originalTextVariants value to its translation in ${targetLanguage}. Each key must exactly match its original text variant.
   - Each term has a 'related' array for relationships to characters/groups/other terms
   - Each term has a 'facts' array for statements about the term
   - **RELATED edge guidelines**:
     - Good examples: song related to its composer character, hidden identity related to real identity character, SEKAI related to its owner characters, instrument related to its player character
     - Bad examples: term related to an event (use Event.involve instead), generic "appears in" relationships without meaningful connection, duplicate information already in facts

   Example term (excluding nested related and facts for clarity):
   {
     "identifier": "school_sekai",
     "name": "School SEKAI",
     "originalName": "教室のセカイ",
     "originalTextVariants": ["教室のセカイ", "レオニのセカイ"],
     "translatedName": {"教室のセカイ": "Classroom SEKAI", "レオニのセカイ": "Leo/need's SEKAI"},
     "description": "A special world born from Leo/need members' feelings, manifesting as a school music room where Virtual Singers appear",
     "episodeId": 1,
     "related": [
       {
         "identifier": "school_sekai_related_leoneed",
         "target": {"type": "group", "identifier": "leoneed"},
         "episodeId": 1,
         "context": "This SEKAI was born from Leo/need members' shared feelings and music, serving as their practice and emotional space"
       }
     ],
     "facts": [
       {
         "identifier": "school_sekai_setting",
         "statement": "School SEKAI resembles a school music room",
         "description": "The SEKAI takes the form of a familiar school environment where the band practiced together",
         "episodeId": 1
       }
     ]
   }

4. **Groups**: Music groups/bands/units - only output NEW groups or groups with NEW members
   - Provide: identifier, name, translated name, original name, original text variants
   - Each group has a 'members' array for character members
   - Only include if this is a new group or if new members join an existing group
   - **Original text variants MUST uniquely identify the group**: Include the group's actual name variants only.
     - Good examples for "Leo/need": "レオニード", "Leo/need", "レオ/ニード"
     - Bad examples: "バンド" (band), "グループ" (group) - too generic
   - **Translated names**: Provide an object that maps EVERY originalTextVariants value to its translation in ${targetLanguage}. Each key must exactly match its original text variant.
   - Each group has a 'facts' array for statements about the group

   Example group (excluding nested members and facts for clarity):
   {
     "identifier": "leoneed",
     "name": "Leo/need",
     "originalName": "レオニード",
     "originalTextVariants": ["レオニード", "Leo/need", "レオ/ニード"],
     "translatedName": {"レオニード": "Leo/need", "Leo/need": "Leo/need", "レオ/ニード": "Leo/need"},
     "members": [
       {
         "identifier": "leoneed_member_ichika",
         "target": {"type": "character", "identifier": "ichika"},
         "episodeId": 1,
         "context": "founding member, lead guitarist and vocalist"
       }
     ],
     "facts": [
       {
         "identifier": "leoneed_school_band",
         "statement": "Leo/need is a school band",
         "description": "The band was formed by childhood friends at school",
         "episodeId": 1
       }
     ]
   }

=== NESTED RELATIONS (SIMPLIFIED) ===
**5 edge types only**: CHARACTER_RELATION, INVOLVE, MEMBER_OF, FACT, RELATED

**Character.relations**: Undirected character-to-character relationships
- Target: character only
- Each relation has: identifier, target {type: "character", identifier}, episodeId, context
- **UNDIRECTED**: Relations are bidirectional. If character A already has a relation to B, character B does NOT need to repeat the same relation back. Only one side needs to declare the relation.
- **CRITICAL**: Context must be DETAILED and RICH - include history, emotions, conflicts, reasons
- **Describe dynamics, not just labels**:
  - Good: "childhood friends who drifted apart after middle school, now reconnecting through music"
  - Good: "siblings with tension because Kanade isolated herself after their mother's death, family worried but unable to reach her"
  - Good: "misunderstood each other when Saki felt Ichika was avoiding her, but reconciled after honest conversation"
  - Good: "grew distant after graduation but still care deeply about each other"
  - Bad: "siblings" (just a label, no dynamics)
  - Bad: "bandmates" (missing emotional context)
  - Bad: "friends" (too vague)
- **Include relationship changes**: How they evolved, conflicts that arose, reconciliations, growing bonds or distance

Example:
{
  "identifier": "ichika_saki_complex_friendship",
  "target": {"type": "character", "identifier": "saki"},
  "episodeId": 1,
  "context": "childhood friends and bandmates in Leo/need. Saki was hospitalized for years which strained their friendship. Now reunited through music, working to rebuild their bond while Saki deals with lingering health concerns and Ichika feels guilty about the distance."
}

**Event.involve**: Characters/terms/groups involved in events
- Target: character, term, or group
- Each involvement has: identifier, target {type, identifier}, episodeId, context
- Context describes the involvement and emotional significance

Example:
{
  "identifier": "performance_involves_ichika",
  "target": {"type": "character", "identifier": "ichika"},
  "episodeId": 1,
  "context": "performs as lead guitarist and vocalist, nervous but determined to reunite the band"
}

**Term.related**: Terms related to characters/groups/other terms
- Target: character, group, or term (NOT event)
- Each relation has: identifier, target {type, identifier}, episodeId, context
- Context describes how the term relates to the target entity
- **Good examples**: song related to its composer ("'Untitled' composed by Kanade"), hidden identity related to real identity ("K is Kanade's online persona"), SEKAI related to its owner characters ("Leo/need's SEKAI created by the four members' feelings"), instrument related to its player ("Ichika's guitar, her treasured instrument")
- **Bad examples**: term related to an event (use Event.involve instead), generic relationships without depth ("appears in the story"), duplicate information already stated in facts

Example:
{
  "identifier": "leoneed_sekai_related_leoneed",
  "target": {"type": "group", "identifier": "leoneed"},
  "episodeId": 1,
  "context": "This SEKAI was born from Leo/need members' shared feelings and music, serving as their practice and emotional space"
}

**Group.members**: Character members of groups
- Target: character only
- Each member has: identifier, target {type: "character", identifier}, episodeId, context
- Context describes role and dynamics

Example:
{
  "identifier": "leoneed_member_ichika",
  "target": {"type": "character", "identifier": "ichika"},
  "episodeId": 1,
  "context": "founding member, guitarist and main vocalist, acts as emotional anchor for the group"
}

=== FACTS (NESTED WITHIN ENTITIES) ===
**Facts are nested within characters, events, terms, and groups - NOT a separate top-level array.**
- Character facts go in character.facts array
- Event facts go in event.facts array
- Term facts go in term.facts array
- Group facts go in group.facts array
- Each fact includes: identifier, statement, description, episodeId (NO edges array)
- Facts describe attributes or statements about their parent entity
- Examples: "Ichika plays guitar in Leo/need", "Miku can enter the SEKAI", "Kanade composes music at night"
- ONLY extract NEW facts - do not re-output facts already in context

Example fact in character.facts:
{
  "identifier": "ichika_plays_guitar",
  "statement": "Ichika plays guitar",
  "description": "She is the guitarist of Leo/need",
  "episodeId": 1
}

=== EXISTING CONTEXT FORMAT ===
The context shows:
- **CHARACTERS**: Full details with identifier (if available), name, translated names, gender, group, original text variants
- **GROUPS**: Group details with members
- **TERMS**: Term details with descriptions
- **EVENTS**: Event details with descriptions
- **PER-CHARACTER STORYLINES**: Each character's relationships (check here to avoid duplicates)

=== HOW TO USE IDENTIFIERS ===
- For NEW entities: create a unique identifier (lowercase, no spaces/special chars)
- For EXISTING entities in context: use their identifier if shown, otherwise use their name
- In edges: reference targets by their identifier

=== EXTRACTION RULES ===
- **Rich relationship context**: Describe relationships with full detail - history, emotions, conflicts, bonds
- **Update when needed**: Only output entities that are new or have new information to add
- **Identifiers**: Every character/event/term MUST have a unique identifier
- **Full names**: Use full character names (e.g., "Hoshino Ichika", not "Ichika")
- **Original variants**: Include ALL Japanese name variants for characters
- **Relations are nested**: character.relations, event.involve, group.members
- **Facts are nested**: Facts go inside characters/events/terms/groups
- **Meaningful connections**: Every entity should connect meaningfully to the story
- **Check storylines**: Build upon existing relations in PER-CHARACTER STORYLINES
- **Groups**: New groups go in groups array, connect members with detailed role context
- **English pivot**: Event/term names and descriptions in English only
- **Target language translations**: Character and term translated names in ${targetLanguage}
- **Episode IDs**: Use simple numbers (1, 2, 3, etc.)
- **Extract from THIS story only** - don't invent information`;
}

export function buildExtractionPrompt(
  targetLanguage: string,
  scenariosData: IScenarioData[],
  existingContext: RetrievedContext
): { systemPrompt: string; userPrompt: string } {
  const dialogueLines: string[] = [];

  for (let i = 0; i < scenariosData.length; i++) {
    const scenarioData = scenariosData[i];
    dialogueLines.push(`\n=== EPISODE ${i + 1} ===\n`);

    for (const snippet of scenarioData.Snippets) {
      if (snippet.Action === 1) {
        const talkData = scenarioData.TalkData[snippet.ReferenceIndex];
        const speaker = talkData.WindowDisplayName || "Unknown";
        dialogueLines.push(`[${speaker}]: ${talkData.Body}`);
      }
    }
  }

  const contextMd = formatContextAsMarkdown(existingContext);
  const systemPrompt = generateSystemPrompt(targetLanguage);
  const userPrompt = `${contextMd}

=== STORY EPISODES ===
${dialogueLines.join("\n")}

Extract the data now.`;

  return { systemPrompt, userPrompt };
}
