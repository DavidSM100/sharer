<script>
  import plusImg from "../assets/plus.svg";
  import chevronUpImg from "../assets/chevron-up.svg";
  import Send from "./Send.svelte";
  import Receive from "./Receive.svelte";

  let showSendDiv = $state(false);
</script>

<main>
  <div>
    <button onclick={() => (showSendDiv = !showSendDiv)}>
      <img hidden={showSendDiv} src={plusImg} alt="plus" />
      <img hidden={!showSendDiv} src={chevronUpImg} alt="hide" />
    </button>
  </div>

  {#if showSendDiv}
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
