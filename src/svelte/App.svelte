<script lang="ts">
  import plusImg from "../assets/plus.svg";
  import chevronUpImg from "../assets/chevron-up.svg";
  import Send from "./Send.svelte";
  import Receive from "./Receive.svelte";
  import { showSendDiv } from "../ts/state.svelte";

</script>

<main>
  <div>
    <button onclick={() => (showSendDiv.show = !showSendDiv.show)}>
      <img hidden={showSendDiv.show} src={plusImg} alt="plus" />
      <img hidden={!showSendDiv.show} src={chevronUpImg} alt="hide" />
    </button>
  </div>

  {#if showSendDiv.show}
    <Send />
  {/if}

  <Receive />
</main>

<style>
  button {
    background-color: #eee;
  }

  button:hover {
    background-color: #ddd;
  }

  button:active {
    background-color: #ccc;
  }

  @media (prefers-color-scheme: dark) {
    button {
      background-color: #333;
    }
    button:hover {
      background-color: #444;
    }
    button:active {
      background-color: #555;
    }
  }
</style>
