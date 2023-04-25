import { net } from "electron";


interface HttpConfig {
  url: string,
  method?: string
}

export const http = (config: HttpConfig): Promise<any> => {
  return new Promise((resolve, reject) => {
    const request = net.request({
      url: `${config.url}`,
      method: config.method || 'GET'
    })

    let data: Buffer | null = null
    request.on('response', response => {
      response.on('error', reject)
      response.on('aborted', reject)
      response.on('end', () => {
        if (data) resolve(data.toString())
        else resolve({})
      })

      response.on('data', chunk => {
        if (!data) data = Buffer.from(chunk)
        else data = Buffer.concat([ data, chunk ])
      })
    })
    .on('error', reject)
    .on('abort', reject)
    .end()
  })
}
