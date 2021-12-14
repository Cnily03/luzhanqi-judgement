const input_sid = document.querySelector("input[name='sid']");
input_sid.oninput = input_sid.onpropertychange = () => {
    input_sid.value = input_sid.value.replace(/[^a-z0-9]/gi, '');
}
const dom_form = document.querySelector("form#create-room");
dom_form.onsubmit = () => {
    let formData = getFormData(dom_form);
    xmlhttpRequest({
        url: "/operate/createRoom",
        data: JSON.stringify(formData),
        responseType: "json",
        method: "POST",
        onload: (_xhr) => {
            data = _xhr.response;
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