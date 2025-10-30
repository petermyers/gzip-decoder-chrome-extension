// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "gzipDecode",
    title: "Gzip Decode",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "gzipDecode") {
    let selectedText = info.selectionText;
    
    if (!selectedText || selectedText.trim() === '') {
      await chrome.storage.local.set({
        decodedText: "",
        status: "failed",
        error: "No text selected. Please highlight text and try again.",
        timestamp: new Date().toISOString()
      });
      try {
        await chrome.action.openPopup();
      } catch (e) {
        // Do nothing...we couldn't open the popup...you can always just click the extension icon.
      }
      return;
    }
    
    if (selectedText.startsWith("COMPRESSED")) {
      selectedText = selectedText.substring("COMPRESSED".length);
    }
    
    await decodeGzip(selectedText);
    
    try {
      await chrome.action.openPopup();
    } catch (e) {
      // Do nothing...we couldn't open the popup...you can always just click the extension icon.
    }
  }
});

async function decodeGzip(text) {
  try {
    let binaryData;
    const cleanText = text.replace(/\s/g, '');
    const binaryString = atob(cleanText);
    binaryData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      binaryData[i] = binaryString.charCodeAt(i);
    }

    const decompressedStream = new Response(
      new Response(binaryData).body.pipeThrough(
        new DecompressionStream("gzip")
      )
    );
    
    const decompressedData = await decompressedStream.text();
    
    chrome.storage.local.set({
      decodedText: decompressedData,
      status: "success",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    chrome.storage.local.set({
      decodedText: "",
      status: "failed",
      error: "Not a valid gzip payload.",
      timestamp: new Date().toISOString()
    });
  }
}
