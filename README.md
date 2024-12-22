# Sharer

Simple [webxdc](https://webxdc.org) to send files, it automatically splits the files in parts and join the parts when they are received. It can make easier to send files over email, it can also be useful to bypass email providers attachments max-size limit.

## Development

### Build

`pnpm run build`

You can set `NODE_ENV=debug` before building to include [eruda](https://github.com/liriliri/eruda).

### Test in the browser

`pnpm run serve`

For more advanced testing run the webxdc-dev tool after the server starts:
`pnpm run webxdc-dev`
