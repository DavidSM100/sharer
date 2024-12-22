<main></main>

<style>
  main {
    display: inline-block;
    border: 5px solid #ddd;
    border-bottom: 5px solid #3498db;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 2s linear infinite;
    vertical-align: middle;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
