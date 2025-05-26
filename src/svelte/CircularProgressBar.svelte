<script lang="ts">
  let { progress, text }: {progress: number, text: string} = $props();
</script>

<div
  class="outerDiv"
  style="background:conic-gradient(rgb(2, 222, 2) {(progress / 100) *
    360}deg, gray 0deg);"
>
  <div class="innerDiv">
    {text}
  </div>
</div>

<style>
  .outerDiv {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: conic-gradient(gray 0deg, gray 0deg);
  }

  .innerDiv {
    width: 30px;
    height: 30px;
    background-color: #eee;
    border-radius: 50%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-weight: bolder;
    font-size: 10px;
  }

  @media(prefers-color-scheme: dark) {
    .innerDiv {
      background-color: #333;
    }
  }
</style>
