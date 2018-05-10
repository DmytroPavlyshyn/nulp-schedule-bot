const inst = []

$('#stud select[name="inst"]').find('option').each((index, option) => {
    const $option = $(option)
    inst.push({
        value: $option.attr('value'),
        name: $option.text()
    })
});

console.log(inst)