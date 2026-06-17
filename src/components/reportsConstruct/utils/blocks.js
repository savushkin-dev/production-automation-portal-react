/**
 * Добавляет все кастомные блоки в редактор GrapesJS
 * @param {Object} editor - экземпляр редактора GrapesJS
 */
export function addBlocks(editor) {

    editor.BlockManager.add("text-block", {
        label: "<i class=\"fa-solid fa-font\"></i> Текстовое поле",
        content: "<div style=\"word-wrap: break-word; font-size: 14px; z-index:100\">Введите текст...</div>",
        category: "Текст",
    });
    editor.BlockManager.add("h1", {
        label: "<i class=\"fa-solid fa-heading\"></i>1 Заголовок h1",
        content: "<div style='padding:0; font-size:2em; font-weight:bold; z-index:100 '>Заголовок h1</div>",
        category: "Заголовки",
    });
    editor.BlockManager.add("h2", {
        label: "<i class=\"fa-solid fa-heading\"></i>2 Заголовок h2",
        content: "<div style='padding:0; font-size:1.5em; font-weight:bold; z-index:100 '>Заголовок h2</div>",
        category: "Заголовки",
    });
    editor.BlockManager.add("h3", {
        label: "<i class=\"fa-solid fa-heading\"></i>3 Заголовок h3",
        content: "<div style='padding:0; font-size:1.17em; font-weight:bold; z-index:100 '>Заголовок h3</div>",
        category: "Заголовки",
    });
    editor.BlockManager.add("h4", {
        label: "<i class=\"fa-solid fa-heading\"></i>4 Заголовок h4",
        content: "<div style='padding:0; font-size:1em; font-weight:bold; z-index:100 '>Заголовок h4</div>",
        category: "Заголовки",
    });
    editor.BlockManager.add("h5", {
        label: "<i class=\"fa-solid fa-heading\"></i>5 Заголовок h5",
        content: "<div style='padding:0; font-size:0.83em; font-weight:bold; z-index:100 '>Заголовок h5</div>",
        category: "Заголовки",
    });
    editor.BlockManager.add("h6", {
        label: "<i class=\"fa-solid fa-heading\"></i>6 Заголовок h6",
        content: "<div style='padding:0; font-size:0.67em; font-weight:bold; z-index:100 '>Заголовок h6</div>",
        category: "Заголовки",
    });

    editor.Blocks.add('line-block', {
        label: '<i class="fa-solid fa-window-minimize"></i> Горизонтальная линия',
        content: {
            tagName: 'div',
            attributes: {
                'data-line-type': 'horizontal'
            },
            style: {
                'width': '100%',
                'height': '2px',
                'background-color': '#000',
                'z-index': '100',
                'margin': '0',
                'padding': '0',
            }
        },
        category: "Линии",
    });

    editor.Blocks.add('vertical-line-block', {
        label: '<i class="fa-solid fa-window-minimize fa-rotate-90"></i> Вертикальная линия',
        content: {
            tagName: 'line',
            attributes: {
                'data-line-type': 'vertical'
            },
            style: {
                'width': '2px',
                'height': '50px',
                'background-color': '#000',
                'z-index': '99',
                'margin': '0',
                'display': 'inline-block',
                'padding': '0',
            }
        },
        category: "Линии",
    });
}