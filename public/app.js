const keywords = 
[
    'aws',
    'cleanDocx',
    'diffDocx',
    'email',
    'excelFileCheck',
    'excelWritingBulkChk',
    'fixDocx',
    'jwt',
    'kms',
    'lcs',
    'organization',
    'sentEvent',
    'separateCode',
    'sm',
    'templateDataParse',
    'test',
    'uaparse',
    'uuid'
];

const keywordSelect = document.querySelector('#keyword');
const resultBox = document.querySelector('#result');
const statusBox = document.querySelector('#status');
const curlBox = document.querySelector('#curl');
const sendButton = document.querySelector('#send');
const modeButtons = document.querySelectorAll('[data-mode]');
const urlStatus = 
{
    base: window.location.origin,
    mode: 'b',
    keyword: 'aws'
};

const updateCurl = () => 
{
    const { base, mode, keyword } = urlStatus;
    curlBox.textContent = `curl -X GET "${base}/${mode}/${keyword}`;
};

const renderKeywords = () => 
{
    keywordSelect.innerHTML = '';
    for (const keyword of keywords) 
    {
        const option = document.createElement('option');
        option.value = keyword;
        option.textContent = keyword;
        keywordSelect.appendChild(option);
    }
};

const setMode = (mode) => 
{
    urlStatus.mode = mode;
    modeButtons.forEach((btn) => 
    {
        btn.classList.toggle('is-active', btn.dataset.mode === mode);
    });

    updateCurl();
};

const setKeyword = (keyword) =>
{
    urlStatus.keyword = keyword;
    updateCurl();
};

const formatJson = (data) => 
{
    try 
    {
        return JSON.stringify(data, null, 2);
    }
    catch 
    {
        return String(data);
    }
};

const sendRequest = async () => 
{
    const { mode, keyword } = urlStatus;
    if (!keyword) return;

    const url = `/${mode}/${keyword}`;
    updateCurl(keyword);

    resultBox.textContent = 'Loading...';
    statusBox.textContent = '...';
    statusBox.style.color = '#1c222b';

    try 
    {
        const res = await fetch(url);
        const text = await res.text();
        let body = text;
        try 
        {
            body = formatJson(JSON.parse(text));
        }
        catch
        {
            body = text || '(empty)';
        }

        statusBox.textContent = `${res.status} ${res.statusText}`;
        statusBox.style.color = res.ok ? '#23565c' : '#b8513b';
        resultBox.textContent = body;
    }
    catch (err) 
    {
        statusBox.textContent = 'Network error';
        statusBox.style.color = '#b8513b';
        resultBox.textContent = String(err);
    }
};

modeButtons.forEach((btn) => 
{
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

sendButton.addEventListener('click', sendRequest);
keywordSelect.addEventListener('change', () => setKeyword(keywordSelect.value));

renderKeywords();
