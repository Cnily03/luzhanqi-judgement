const input_sid = document.querySelector("input[name='sid']");
input_sid.oninput = input_sid.onpropertychange = () => {
    input_sid.value = input_sid.value.replace(/[^a-z0-9]/gi, '');
}
const dom_form_create = document.querySelector("form#create-room");
const dom_form_join = document.querySelector("form#join-room");
dom_form_create.onsubmit = () => {
    let formData = getFormData(dom_form_create);
    xmlhttpRequest({
        url: "/operate/createRoom",
        data: JSON.stringify(formData),
        responseType: "json",
        method: "POST",
        onload: (_xhr) => {
            const data = _xhr.response;
            if (data.error.code) {
                alert(data.error.message);
            } else {
                window.open(data.url);
            }
        },
        onerror: () => {
            alert("连接超时");
        }
    })
}
dom_form_join.onsubmit = () => {
    let formData = getFormData(dom_form_join);
    xmlhttpRequest({
        url: "/operate/getRoom",
        data: JSON.stringify(formData),
        responseType: "json",
        method: "POST",
        onload: (_xhr) => {
            const data = _xhr.response;
            if (data.error.code) {
                alert(data.error.message);
            } else {
                window.open(data.url);
            }
        },
        onerror: () => {
            alert("连接超时");
        }
    })
}