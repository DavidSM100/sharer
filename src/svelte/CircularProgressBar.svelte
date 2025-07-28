<script lang="ts">
  let { progress, text }: { progress: number; text: string } = $props();
</script>

<div
  class="radial-progress"
  style="--value: {progress};"
  role="progressbar"
  aria-valuenow={progress}>
  {text}
</div>
