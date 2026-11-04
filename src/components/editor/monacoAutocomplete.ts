// Monaco Editor Auto-Completion & Intellisense Provider for programmer66 Python API

export function registerProgrammer66Autocomplete(monaco: any) {
  if (!monaco || monaco._programmer66CompletionsRegistered) {
    return;
  }
  monaco._programmer66CompletionsRegistered = true;

  const CompletionItemKind = monaco.languages.CompletionItemKind;
  const InsertAsSnippet = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;

  monaco.languages.registerCompletionItemProvider('python', {
    triggerCharacters: ['.', '(', '"', "'"],
    provideCompletionItems: (model: any, position: any) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const suggestions: any[] = [];

      // 1. Context: robot.
      if (textUntilPosition.match(/robot\.\s*$/)) {
        suggestions.push(
          {
            label: 'move_to(x, y)',
            kind: CompletionItemKind.Method,
            insertText: 'move_to(${1:0}, ${2:0})',
            insertTextRules: InsertAsSnippet,
            detail: 'robot.move_to(x, y) -> Promise<bool>',
            documentation: {
              value: '**Autonomous Flight**: Directs the physical 3D quadcopter drone to fly smoothly across the farm to target coordinates (x, y).',
            },
          },
          {
            label: 'move(direction)',
            kind: CompletionItemKind.Method,
            insertText: 'move("${1:right}")',
            insertTextRules: InsertAsSnippet,
            detail: 'robot.move(dir) -> Promise<bool>',
            documentation: {
              value: 'Moves the drone 1 tile in direction: `"up"`, `"down"`, `"left"`, or `"right"`.',
            },
          },
          {
            label: 'plant(crop)',
            kind: CompletionItemKind.Method,
            insertText: 'plant("${1:wheat}")',
            insertTextRules: InsertAsSnippet,
            detail: 'robot.plant(crop) -> Promise<bool>',
            documentation: {
              value: 'Fires down the green laser injector to plant a crop at the drone\'s current tile. Crops: `"wheat"`, `"corn"`, `"carrot"`, `"tomato"`, `"potato"`.',
            },
          },
          {
            label: 'water()',
            kind: CompletionItemKind.Method,
            insertText: 'water()',
            detail: 'robot.water() -> Promise<bool>',
            documentation: {
              value: 'Activates the drone misting nozzle to spray hydration mist on the soil plot beneath it.',
            },
          },
          {
            label: 'harvest()',
            kind: CompletionItemKind.Method,
            insertText: 'harvest()',
            detail: 'robot.harvest() -> Promise<bool>',
            documentation: {
              value: 'Spins the golden tractor cutter beam to harvest mature crop and store produce in inventory.',
            },
          },
          {
            label: 'fertilize()',
            kind: CompletionItemKind.Method,
            insertText: 'fertilize()',
            detail: 'robot.fertilize() -> Promise<bool>',
            documentation: {
              value: 'Sprays amethyst nutrient formula onto the plot, increasing nutrients by +50%.',
            },
          },
          {
            label: 'clear_weeds()',
            kind: CompletionItemKind.Method,
            insertText: 'clear_weeds()',
            detail: 'robot.clear_weeds() -> Promise<bool>',
            documentation: {
              value: 'Fires plasma laser to disintegrate invasive weeds on the tile.',
            },
          },
          {
            label: 'get_position()',
            kind: CompletionItemKind.Method,
            insertText: 'get_position()',
            detail: 'robot.get_position() -> [x, y]',
            documentation: {
              value: 'Returns the current grid coordinates `[x, y]` of the drone.',
            },
          },
          {
            label: 'energy',
            kind: CompletionItemKind.Property,
            insertText: 'energy',
            detail: 'robot.energy: number (0-100)',
            documentation: {
              value: 'Current solar battery percentage of the drone.',
            },
          },
          {
            label: 'x',
            kind: CompletionItemKind.Property,
            insertText: 'x',
            detail: 'robot.x: number',
            documentation: { value: 'Current X grid coordinate of the drone.' },
          },
          {
            label: 'y',
            kind: CompletionItemKind.Property,
            insertText: 'y',
            detail: 'robot.y: number',
            documentation: { value: 'Current Y grid coordinate of the drone.' },
          }
        );
        return { suggestions };
      }

      // 2. Context: farm.
      if (textUntilPosition.match(/farm\.\s*$/)) {
        suggestions.push(
          {
            label: 'tiles',
            kind: CompletionItemKind.Property,
            insertText: 'tiles',
            detail: 'farm.tiles: list[Tile]',
            documentation: {
              value: 'List of all unlocked soil tiles on the farm. Ideal for `for tile in farm.tiles:`.',
            },
          },
          {
            label: 'get_tiles()',
            kind: CompletionItemKind.Method,
            insertText: 'get_tiles()',
            detail: 'farm.get_tiles() -> list[Tile]',
            documentation: {
              value: 'Returns a list of all unlocked soil tile objects on the farm.',
            },
          },
          {
            label: 'get_tile(x, y)',
            kind: CompletionItemKind.Method,
            insertText: 'get_tile(${1:0}, ${2:0})',
            insertTextRules: InsertAsSnippet,
            detail: 'farm.get_tile(x, y) -> Tile',
            documentation: {
              value: 'Returns the specific soil tile at grid coordinates (x, y).',
            },
          },
          {
            label: 'money',
            kind: CompletionItemKind.Property,
            insertText: 'money',
            detail: 'farm.money: number',
            documentation: {
              value: 'Current money balance ($) in the farm treasury.',
            },
          },
          {
            label: 'get_money()',
            kind: CompletionItemKind.Method,
            insertText: 'get_money()',
            detail: 'farm.get_money() -> number',
            documentation: {
              value: 'Returns the farm treasury balance in dollars ($).',
            },
          },
          {
            label: 'weather',
            kind: CompletionItemKind.Property,
            insertText: 'weather',
            detail: 'farm.weather: string',
            documentation: {
              value: 'Current weather condition ("sunny", "cloudy", "rainy", "stormy", "drought").',
            },
          },
          {
            label: 'get_weather()',
            kind: CompletionItemKind.Method,
            insertText: 'get_weather()',
            detail: 'farm.get_weather() -> string',
            documentation: {
              value: 'Returns the current weather name.',
            },
          },
          {
            label: 'day',
            kind: CompletionItemKind.Property,
            insertText: 'day',
            detail: 'farm.day: number',
            documentation: { value: 'Current simulation day number.' },
          },
          {
            label: 'width',
            kind: CompletionItemKind.Property,
            insertText: 'width',
            detail: 'farm.width: number',
            documentation: { value: 'Number of grid columns on the farm.' },
          },
          {
            label: 'height',
            kind: CompletionItemKind.Property,
            insertText: 'height',
            detail: 'farm.height: number',
            documentation: { value: 'Number of grid rows on the farm.' },
          }
        );
        return { suggestions };
      }

      // 3. Context: tile.
      if (textUntilPosition.match(/tile\.\s*$/)) {
        suggestions.push(
          {
            label: 'plant(crop)',
            kind: CompletionItemKind.Method,
            insertText: 'plant("${1:wheat}")',
            insertTextRules: InsertAsSnippet,
            detail: 'tile.plant(crop) -> Promise<bool>',
            documentation: {
              value: 'Commands the autonomous drone to fly to this tile and plant the specified seed (`"wheat"`, `"corn"`, `"carrot"`, `"tomato"`, `"potato"`).',
            },
          },
          {
            label: 'water()',
            kind: CompletionItemKind.Method,
            insertText: 'water()',
            detail: 'tile.water(amount=55) -> Promise<bool>',
            documentation: {
              value: 'Commands the autonomous drone to fly to this tile and spray hydration mist on the soil.',
            },
          },
          {
            label: 'harvest()',
            kind: CompletionItemKind.Method,
            insertText: 'harvest()',
            detail: 'tile.harvest() -> Promise<bool>',
            documentation: {
              value: 'Commands the autonomous drone to fly to this tile and harvest mature produce.',
            },
          },
          {
            label: 'fertilize()',
            kind: CompletionItemKind.Method,
            insertText: 'fertilize()',
            detail: 'tile.fertilize() -> Promise<bool>',
            documentation: {
              value: 'Commands the drone to apply fertilizer (+50% nutrients).',
            },
          },
          {
            label: 'clear_weeds()',
            kind: CompletionItemKind.Method,
            insertText: 'clear_weeds()',
            detail: 'tile.clear_weeds() -> Promise<bool>',
            documentation: {
              value: 'Commands the drone to remove all weeds from the plot.',
            },
          },
          {
            label: 'is_empty()',
            kind: CompletionItemKind.Method,
            insertText: 'is_empty()',
            detail: 'tile.is_empty() -> bool',
            documentation: {
              value: 'Returns `True` if no crop is currently planted on this tile.',
            },
          },
          {
            label: 'needs_water()',
            kind: CompletionItemKind.Method,
            insertText: 'needs_water()',
            detail: 'tile.needs_water() -> bool',
            documentation: {
              value: 'Returns `True` if soil moisture is below 35%.',
            },
          },
          {
            label: 'is_ready()',
            kind: CompletionItemKind.Method,
            insertText: 'is_ready()',
            detail: 'tile.is_ready() -> bool',
            documentation: {
              value: 'Returns `True` if the crop has reached the mature stage and is ready for harvesting.',
            },
          },
          {
            label: 'crop',
            kind: CompletionItemKind.Property,
            insertText: 'crop',
            detail: 'tile.crop: string | None',
            documentation: {
              value: 'The name of the planted crop (`"wheat"`, `"corn"`, etc.) or `None` if empty.',
            },
          },
          {
            label: 'stage',
            kind: CompletionItemKind.Property,
            insertText: 'stage',
            detail: 'tile.stage: string ("empty" | "seedling" | "growing" | "mature")',
            documentation: {
              value: 'Current growth lifecycle stage of the plant.',
            },
          },
          {
            label: 'moisture',
            kind: CompletionItemKind.Property,
            insertText: 'moisture',
            detail: 'tile.moisture: number (0-100)',
            documentation: {
              value: 'Current water saturation of the soil plot.',
            },
          },
          {
            label: 'nutrients',
            kind: CompletionItemKind.Property,
            insertText: 'nutrients',
            detail: 'tile.nutrients: number (0-100)',
            documentation: {
              value: 'Soil nutrient level. Higher nutrients accelerate crop maturation.',
            },
          },
          {
            label: 'x',
            kind: CompletionItemKind.Property,
            insertText: 'x',
            detail: 'tile.x: number',
            documentation: { value: 'Tile X coordinate on grid.' },
          },
          {
            label: 'y',
            kind: CompletionItemKind.Property,
            insertText: 'y',
            detail: 'tile.y: number',
            documentation: { value: 'Tile Y coordinate on grid.' },
          }
        );
        return { suggestions };
      }

      // 4. Context: inventory.
      if (textUntilPosition.match(/inventory\.\s*$/)) {
        suggestions.push(
          {
            label: 'count(item)',
            kind: CompletionItemKind.Method,
            insertText: 'count("${1:wheat}")',
            insertTextRules: InsertAsSnippet,
            detail: 'inventory.count(item) -> number',
            documentation: {
              value: 'Returns the quantity of an item currently held in storage (e.g. `"wheat"`, `"corn"`, `"wheat_seed"`).',
            },
          },
          {
            label: 'sell(item, count)',
            kind: CompletionItemKind.Method,
            insertText: 'sell("${1:wheat}", ${2:5})',
            insertTextRules: InsertAsSnippet,
            detail: 'inventory.sell(item, count) -> bool',
            documentation: {
              value: 'Sells harvested crops to the marketplace for cash ($).',
            },
          },
          {
            label: 'buy_seeds(crop, count)',
            kind: CompletionItemKind.Method,
            insertText: 'buy_seeds("${1:wheat}", ${2:5})',
            insertTextRules: InsertAsSnippet,
            detail: 'inventory.buy_seeds(crop, count) -> bool',
            documentation: {
              value: 'Purchases crop seeds from the marketplace using treasury funds.',
            },
          }
        );
        return { suggestions };
      }

      // 5. Global keywords & friendly templates
      suggestions.push(
        {
          label: 'farm',
          kind: CompletionItemKind.Variable,
          insertText: 'farm',
          detail: 'farm: Agricultural System API',
          documentation: { value: 'Root object for querying the farm grid, money, weather, and plots.' },
        },
        {
          label: 'robot',
          kind: CompletionItemKind.Variable,
          insertText: 'robot',
          detail: 'robot: AeroDrone-01 Autonomous Drone',
          documentation: { value: 'Control object for direct drone flight, positioning, and tool activation.' },
        },
        {
          label: 'inventory',
          kind: CompletionItemKind.Variable,
          insertText: 'inventory',
          detail: 'inventory: Farm Warehouse & Market',
          documentation: { value: 'Storage and commerce API for trading seeds and harvested produce.' },
        },
        {
          label: 'print(...)',
          kind: CompletionItemKind.Function,
          insertText: 'print(${1:message})',
          insertTextRules: InsertAsSnippet,
          detail: 'print(*args) -> None',
          documentation: { value: 'Outputs message to the Farm Console terminal below.' },
        },
        {
          label: 'range(...)',
          kind: CompletionItemKind.Function,
          insertText: 'range(${1:4})',
          insertTextRules: InsertAsSnippet,
          detail: 'range(stop) -> list[int]',
          documentation: { value: 'Generates a sequence of numbers, e.g. for looping across grid rows or columns.' },
        },
        // Helpful Python beginner snippets
        {
          label: 'snippet_plant_all',
          kind: CompletionItemKind.Snippet,
          insertText: [
            '# Loop through every tile and plant wheat',
            'for tile in farm.tiles:',
            '    if tile.is_empty():',
            '        tile.plant("wheat")',
          ].join('\n'),
          detail: 'Snippet: Plant all empty plots with wheat',
          documentation: { value: 'Beginner snippet: Dispatches drone to plant wheat across empty plots.' },
        },
        {
          label: 'snippet_water_all',
          kind: CompletionItemKind.Snippet,
          insertText: [
            '# Loop through every tile and water dry plots',
            'for tile in farm.tiles:',
            '    if tile.needs_water():',
            '        tile.water()',
          ].join('\n'),
          detail: 'Snippet: Water all dry soil plots',
          documentation: { value: 'Beginner snippet: Dispatches drone to spray water mist on thirsty plots.' },
        },
        {
          label: 'snippet_harvest_all',
          kind: CompletionItemKind.Snippet,
          insertText: [
            '# Harvest all ready crops',
            'for tile in farm.tiles:',
            '    if tile.is_ready():',
            '        tile.harvest()',
          ].join('\n'),
          detail: 'Snippet: Harvest all mature crops',
          documentation: { value: 'Beginner snippet: Dispatches drone to harvest mature crops.' },
        }
      );

      return { suggestions };
    },
  });
}

