import babel from '@rollup/plugin-babel'
import jscc from 'rollup-plugin-jscc'
import userscriptHeader from 'rollup-plugin-userscript-header'

const pkg = require('./package.json')
const platform = process.env.TARGET_PLATFORM || "bunkerchan";
const PLATFORM_DESCRIPTOR = require(`./src/platform/${platform}.json`);
let grants = [
    PLATFORM_DESCRIPTOR.conditions._BYPASS_CORS ? "GM_xmlhttpRequest" : "",
    PLATFORM_DESCRIPTOR.conditions._PATCH_REPLY ? "unsafeWindow" : ""
].filter(x => x);
grants = grants.length === 0 ? ["none"] : grants

export default {
    input: `./src/platform/${platform}.js`,
    output: {
        file: `./dist/${PLATFORM_DESCRIPTOR.scriptName}.user.js`,
        format: 'iife'
    },
    plugins: [jscc({values: PLATFORM_DESCRIPTOR.conditions}), babel({babelHelpers: "bundled"}), userscriptHeader({
        overwrite: {
            name: PLATFORM_DESCRIPTOR.scriptName,
            namespace: "http://4chan.org",
            version: pkg.version,
            author: pkg.author,
            include: PLATFORM_DESCRIPTOR.include,
            match: '',
            grant: grants
        }
    })]
}
