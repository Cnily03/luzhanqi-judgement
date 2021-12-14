/**
 * Copy text to the Clipboard.
 * @param {*} copyEl - The object needed to be copied.
 * @param {string=} type - The type of the thing to be copied.
 * - Default value: `text`
 * @param {function=} callback - Run `callback(isSupport = false)` if the browser does not support copy via javascript, and run `callback(isSupport = true)` if supports.
 * @returns {*} Same as copyEl.
 */
const setClipboard = (copyEl, type = "text", callback = () => {}) => {
    if (type == "text") type = "text/plain";
    const copyReact = (e) => {
        e.clipboardData.setData(type, copyEl);
        e.preventDefault();
    };
    document.addEventListener("copy", copyReact);
    try {
        document.execCommand("copy");
        callback(true)
    } catch (e) {
        callback(false);
    }
    document.removeEventListener("copy", copyReact);
    return copyEl;
};

/**
 * Send xml http request.
 * @param {object} options
 * @param {string} options.url - Requested url.
 * @param {string=} options.method - Requested method.
 * - Default: `GET`
 * - Optional value: `POST` | `GET`
 * @param {*=} options.data - Requested data when the method is `POST`.
 * @param {string=} options.contentType - the content-type of the requested data. 
 * - Default value of `GET` method: `application/x-www-form-urlencoded`
 * - Default value of `POST` method: `text/plain; charset=UTF-8`
 * @param {string=} options.responseType - The type of what the server response.
 * - Default: `text`
 * - Optional value: `text` | `json` | `blob` | `document` | `arraybuffer`
 * @param {function=} options.onload - Run `onload()` when the request is done.
 * @param {function=} options.onerror - Run `onerror()` when the request throws an error.
 * @returns {object} The instance of XmlHttpRequest.
 */
const xmlhttpRequest = (options) => {
    // json.url = json.url;
    options.method = (options.method || "GET").toUpperCase();
    options.data = options.data || undefined;
    options.contentType = options.contentType || ({
        "GET": "application/x-www-form-urlencoded",
        "POST": "text/plain; charset=UTF-8"
    })[options.method];
    options.responseType = options.responseType || "text";
    options.onload = options.onload || (() => {});
    options.onerror = options.onerror || (() => {});
    const _xhr = new XMLHttpRequest();
    _xhr.open(options.method, options.url, true);
    _xhr.responseType = options.responseType;
    _xhr.setRequestHeader(
        "Content-Type",
        options.contentType
    );
    _xhr.onload = () => options.onload(_xhr);
    _xhr.onerror = () => options.onerror(_xhr);
    _xhr.send(options.data);
    return _xhr;
};

/**
 * Get the data of a form.
 * @param {object} formDom - The dom of the form.
 * @returns {object} The data of the form.
 */
const getFormData = (formDom) => {
    let _tags = formDom.getElementsByTagName("input");
    var _data = {};
    for (let i = 0; i < _tags.length; i++) {
        let _tag = _tags[i];
        let _name = _tag.name,
            _value = _tag.value;
        if (!_name || _tag.type == "submit") continue;
        _data[_name] = _value;
    };
    return _data;
}