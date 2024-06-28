document.getElementById('fileInput').addEventListener('change', handleFile, false);

const dropArea = document.getElementById('drop-area');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener('drop', handleDrop, false);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFile({ target: { files: files } });
}

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                const decodedText = code.data;
                document.getElementById('qrText').innerText = decodedText;
                const ppInfo = extractPPInfo(decodedText);
                displayPPInfo(ppInfo);
            } else {
                alert('No QR code found.');
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function _decode(ppText) {
    const ppObj = {};
    let fieldNo = '';
    let fieldSize = '';
    for (let i = 0; i < ppText.length; i++) {
        if (fieldNo === '') {
            fieldNo = ppText.substring(i, i + 2);
            i += 1;
        } else if (fieldSize === '') {
            fieldSize = parseInt(ppText.substring(i, i + 2)).toString();
            i += 1;
        } else {
            ppObj[fieldNo] = ppText.substring(i, i + parseInt(fieldSize));
            i += parseInt(fieldSize) - 1;
            fieldNo = '';
            fieldSize = '';
        }
    }
    return ppObj;
}

function decode(ppText) {
    const obj = _decode(ppText);

    const merchantInfo = obj['29'];
    if (merchantInfo) {
        const merchantObj = _decode(merchantInfo);
        if (merchantObj['00'] !== 'A000000677010111') {
            return null;
        }
        Object.entries(merchantObj).forEach(([k, v]) => {
            if (k !== '00') {
                obj['29_acc_type'] = k;
                obj['29_acc_no'] = v;
            }
        });
    }

    const merchantInfo30 = obj['30'];
    if (merchantInfo30) {
        const merchantObj = _decode(merchantInfo30);
        if (merchantObj['00'] === 'A000000677010112') {
            Object.entries(merchantObj).forEach(([k, v]) => {
                if (k === '01') {
                    obj['30_biller_id'] = v;
                } else if (k === '02') {
                    obj['30_merchant_id'] = v;
                } else if (k === '03') {
                    obj['30_txn_id'] = v;
                }
            });
        }
    }

    const merchantInfo31 = obj['31'];
    if (merchantInfo31) {
        const merchantObj = _decode(merchantInfo31);
        Object.entries(merchantObj).forEach(([k, v]) => {
            if (k === '02') {
                obj['31_merchant_id'] = v;
            } else if (k === '04') {
                obj['31_txn_id'] = v;
            }
        });
    }

    const merchantInfo62 = obj['62'];
    if (merchantInfo62) {
        const merchantObj = _decode(merchantInfo62);
        Object.entries(merchantObj).forEach(([k, v]) => {
            if (k === '07') {
                obj['62_ref_3'] = v;
            }
        });
    }

    return obj;
}

function extractPPInfo(content) {
    const obj = decode(content);
    if (obj) {
        let merchantId = obj['30_biller_id'] || obj['29_acc_no'] || '';

        let accountType = 'UNKNOWN';
        if (merchantId) {
            if (merchantId.length === 11 || (merchantId.length === 13 && merchantId.startsWith('0066'))) {
                accountType = 'MSISDN';
                merchantId = merchantId.replace('0066', '0');
            } else if (merchantId.length === 13) {
                accountType = 'NATID';
            } else if (merchantId.length === 15) {
                accountType = 'EWALLET';
            }
        }

        let merchantName = obj['59'] || merchantId;
        let amount = obj['54'] || '0.00';
        accountType = obj['30_biller_id'] ? 'BILLERID' : accountType;

        return {
            merchantName: merchantName,
            merchantId: merchantId,
            accountType: accountType,
            amount: amount
        };
    } else {
        throw new Error(`Invalid format:\n\n${content}`);
    }
}

function displayPPInfo(ppInfo) {
    document.getElementById('merchantName').innerText = ppInfo.merchantName;
    document.getElementById('accountType').innerText = ppInfo.accountType;
    document.getElementById('merchantId').innerText = ppInfo.merchantId;
    document.getElementById('amount').innerText = ppInfo.amount;
}
