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

    request.on('response', response => {
      //console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('error', reject)
      response.on('aborted', reject)

      response.on('data', data => {
        // console.log(`Url received: ${url}`)

        resolve(data.toString())
      })
    })
    .on('error', reject)
    .on('abort', reject)
    .end()
  })
}
