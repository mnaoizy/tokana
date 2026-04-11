import { describe, it, expect } from "vitest";
import { CharacterDefinition } from "../../src/dict/CharacterDefinition.js";

describe("CharacterDefinition", () => {
  it("should add and lookup character classes", () => {
    const charDef = new CharacterDefinition();
    const defaultId = charDef.addCharacterClass({
      name: "DEFAULT",
      invoke: false,
      group: true,
      length: 0,
    });
    const kanjiId = charDef.addCharacterClass({
      name: "KANJI",
      invoke: false,
      group: false,
      length: 2,
    });

    // Set kanji range
    charDef.setCharacterCategory(0x4e00, 0x9fff, kanjiId, [kanjiId]);

    // Check kanji character
    const kanjiClass = charDef.lookup(0x6771); // 東
    expect(kanjiClass.name).toBe("KANJI");

    // Check ASCII (should be DEFAULT = class 0)
    const defaultClass = charDef.lookup(0x41); // A
    expect(defaultClass.name).toBe("DEFAULT");
  });

  it("should serialize and deserialize invoke definitions", () => {
    const charDef = new CharacterDefinition();
    charDef.addCharacterClass({
      name: "DEFAULT",
      invoke: false,
      group: true,
      length: 0,
    });
    charDef.addCharacterClass({
      name: "KANJI",
      invoke: true,
      group: false,
      length: 2,
    });

    const buf = charDef.toInvokeBuffer();
    const restored = CharacterDefinition.fromBuffers(
      charDef.getCategoryMap(),
      charDef.getCompatibleCategoryMap(),
      buf
    );

    const classes = restored.getCharacterClasses();
    expect(classes).toHaveLength(2);
    expect(classes[0].name).toBe("DEFAULT");
    expect(classes[0].invoke).toBe(false);
    expect(classes[0].group).toBe(true);
    expect(classes[1].name).toBe("SPACE"); // CHARACTER_CATEGORY_NAMES[1]
    expect(classes[1].invoke).toBe(true);
    expect(classes[1].group).toBe(false);
    expect(classes[1].length).toBe(2);
  });
});
