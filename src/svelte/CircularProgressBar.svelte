<script lang="ts">
  let { progress, text }: { progress: number; text: string } = $props();
</script>

<div
  class="radial-progress bg-base-200 border-base-200 border-4"
  style="--value: {progress}; --size: 3rem"
  role="progressbar"
  aria-valuenow={progress}>
  <small>{text}</small>
</div>
