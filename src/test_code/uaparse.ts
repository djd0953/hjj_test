import {UAParser} from 'ua-parser-js'

const run = async () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"

    const parser = new UAParser()
    parser.setUA(ua)
    console.log(parser.getBrowser().name)
}

export default run