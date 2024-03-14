document.addEventListener('DOMContentLoaded', function () {
    const modeRadios = document.getElementsByName('mode');
    const textDropdown = document.getElementById('textDropdown');
    const titleField = document.getElementById('titleField');
    const textArea = document.getElementById('textArea');
    const addButton = document.getElementById('addButton');
    const removeButton = document.getElementById('removeButton');
    const copyButton = document.getElementById('copyButton');

    // Load texts into dropdown
    function loadTexts() {
        chrome.storage.local.get(null, function (items) {
            textDropdown.innerHTML = '<option value="">Select a text...</option>';
            Object.keys(items).forEach(key => {
                let option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                textDropdown.appendChild(option);
            });
            updateUI(); // Ensure UI is updated right after loading texts
        });
    }

    // Update the UI based on the selected mode and loaded texts
    function updateUI() {
        const isUpdateMode = document.getElementById('update').checked;
        addButton.style.display = isUpdateMode ? 'inline' : 'none';
        removeButton.style.display = isUpdateMode ? 'inline' : 'none';
        titleField.style.display = isUpdateMode ? 'block' : 'none';

        // Clear text area and title field initially or when mode changes
        textArea.value = '';
        titleField.value = '';

        // Automatically populate title and text area if in access mode and a text is selected
        if (!isUpdateMode && textDropdown.value) {
            const selectedKey = textDropdown.value;
            chrome.storage.local.get(selectedKey, function (result) {
                textArea.value = result[selectedKey] || '';
                titleField.value = selectedKey; // Auto-populate title field in access mode
            });
        }
    }

    // Event listeners
    textDropdown.addEventListener('change', function() {
        // Populate title field and text area based on the selected dropdown value
        const selectedKey = textDropdown.value;
        titleField.value = selectedKey;
        if (document.getElementById('access').checked) {
            chrome.storage.local.get(selectedKey, function (result) {
                textArea.value = result[selectedKey] || '';
            });
        }
    });

    addButton.addEventListener('click', function () {
        const key = titleField.value;
        const value = textArea.value;
        if (key && value) {
            chrome.storage.local.set({[key]: value}, function() {
                loadTexts(); // Reload texts to reflect the addition
                alert('Text added!');
            });
        }
    });

    removeButton.addEventListener('click', function () {
        const key = titleField.value;
        if (key) {
            chrome.storage.local.remove(key, function() {
                loadTexts(); // Reload texts to reflect the removal
                textArea.value = '';
                titleField.value = '';
                alert('Text removed!');
            });
        }
    });

    copyButton.addEventListener('click', function () {
        textArea.select();
        document.execCommand('copy');
    });

    for (let radio of modeRadios) {
        radio.addEventListener('change', function() {
            updateUI();
        });
    }

    // Load texts and set up UI on popup load
    loadTexts();
});
