<script lang="ts">
    interface CommandSearchResult {
        cmd: Command;
        matches: ReadonlyArray<FuseResultMatch>;
    }

    import {onMount} from "svelte";
    import {Command} from "ragnarok-api";
    import Fuse, {type FuseResultMatch} from "fuse.js";
    import {Settings} from "../ts/settings";

    let input: HTMLInputElement;
    let inputText: string;
    let commandResults: CommandSearchResult[] = [];
    const fuse = new Fuse(Settings.loadedCommands, {
        shouldSort: true,
        isCaseSensitive: true,
        includeMatches: true,
        keys: [
            {
                name: "name",
                weight: 2
            },
            {
                name: "description",
                weight: 0.5
            }
        ]
    });

    onMount(() => {
        input.focus();
    })

    $: {
        if (inputText) {
            const result = fuse.search(inputText);
            commandResults = result.map((i) => {
                return {
                    cmd: i.item,
                    matches: i.matches,
                } as CommandSearchResult
            });
        } else {
            commandResults = [];
        }
    }
    
    function onKeyPressed(event: KeyboardEvent) {
        if (event.key === "Enter") {
            
        }
    }
</script>

<div class="CommandPalette">
    <input type="text" bind:this={input} bind:value={inputText} on:keypress={onKeyPressed}>
    <div id="results">
        {#if commandResults.length === 0}
            No commands found
        {:else}
            {#each commandResults as cmd}
                <span>
                    <strong>{cmd.cmd.name}</strong>
                    <span>{cmd.cmd.description}</span>
                </span>
            {/each}
        {/if}
    </div>
</div>

<style lang="scss">
  .CommandPalette {
    input {
      @include interactable;
      
      width: 100%;
      min-height: 5vh;

      outline: none;
      border: none;
      background-color: var(--code-background);
      color: var(--editor-foreground);
      border-radius: var(--border-radius);
    }

    #results {
      padding: 16px 2px;
    }
  }
</style>
