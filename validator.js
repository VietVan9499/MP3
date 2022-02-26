/**
 *  Fix bugss
 * - find method
 * onSubmit method
 */
function Validator(formSelector) {
    var _this = this; // Trick Tips
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return (element.parentElement);
            }
            element = element.parentElement;
        }
    }

    // Biến này là 1 object chứa tất cả những cái rules
    var formRules = {
        // fullname: 'required',
        // email: 'required|email'
    };

    var validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này';
        },
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Trường này phải là email"
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : ` Vui lập nhập tối thiểu ${min} kí tự `;
            }
        },

        max: function(max) {
            return function(value) {
                return value.length <= max ? undefined : ` Vui lập nhập tối đa ${max} kí tự `;
            }
        },
    };

    //  console.log(formSelector); check đầu tiền
    var formElement = document.querySelector(formSelector);
    // Đề phòng trường hợp sau này khi nhập sai tên id
    // nó sẽ trả ra chữ null 
    // vì vậy phải lấy đúng formElement thì mới thực hiện
    if (formElement) {
        // Lấy ra tất cả những thằng có name và có rules để đảm nó là thẻ input
        var inputs = formElement.querySelectorAll('[name][rules]')
            // Vì thằng inputs là 1 node list
        console.log(inputs);
        for (var input of inputs) {

            var rules = input.getAttribute('rules').split('|');
            console.log(rules);
            for (var rule of rules) {
                console.log(rule)
                var isRuleHasValue = rule.includes(':');
                var ruleInfo;
                if (isRuleHasValue) {
                    ruleInfo = rule.split(':')
                    console.log(ruleInfo);
                    rule = ruleInfo[0];
                    // (ruleInfo[1]) truyền vào function min số 6 vì (ruleInfo[1]) = 6
                    console.log(validatorRules[rule](ruleInfo[1]));
                }
                console.log(rule);

                var ruleFunc = validatorRules[rule];

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                // console.log(input.name)
                // console.log(input.getAttribute('rules'));
                // formRules[input.name] = input.getAttribute('rules');
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    console.log(ruleFunc);
                    // Lần thứ nhất xét cho nó là 1 array
                    // A[i] =
                    formRules[input.name] = [ruleFunc];
                }
            }
            input.onblur = handleValidate;
            input.oninput = handlClearError;

        }

        function handleValidate(event) {
            console.log(formRules[event.target.name]);
            var rules = formRules[event.target.name];
            var errorMessage;

            for (var rule of rules) {
                errorMessage = rule(event.target.value);
                if (errorMessage) break;
            }

            console.log(errorMessage);
            if (errorMessage) {
                var formGroup = getParent(event.target, '.form-group');
                console.log(formGroup);
                if (formGroup) {
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }
            return !errorMessage;
        }

        function handlClearError(event) {
            var formGroup = getParent(event.target, '.form-group');
            var formMessage = formGroup.querySelector('.form-message');
            if (formGroup.classList.contains('invalid') && formMessage) {
                formGroup.classList.remove('invalid');
                formMessage.innerText = "";
            }
        }
    }
    // This vì có constructor
    // console.log(this);

    console.log(formRules);
    formElement.onsubmit = function(event) {
        console.log(event);
        event.preventDefault();
        console.log(_this);
        // Sử dụng trong trường hợp có function
        // mà function được gắn DOM onsubmit => this chính là formElement
        // console.log(this);



        var inputs = formElement.querySelectorAll('[name][rules]')
        var isValid = true;
        for (input of inputs) {
            // handleValidate({
            //     target: input
            // });
            if (!handleValidate({ target: input })) {
                isValid = false;
            }
        }

        console.log(isValid);
        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
                var enableInput = formElement.querySelectorAll('[name]:not([disabled])');

                var formValues = Array.from(enableInput).reduce(function(values, input) {

                    switch (input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        case 'checkbox':
                            // Vì thằng checkbox là 1 array có nghĩa là từ case 'checkbox' xuống thằng break thì nó là 1 array
                            if (!input.matches(':checked')) {
                                values[input.name] = [];
                                return values;
                            }
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }
                            values[input.name].push(input.name);
                            break;
                        case 'file':
                            values[input.name].push(input.file);
                            break;
                        default:
                            values[input.name] = input.value;
                    }

                    return values;
                }, {});

                _this.onSubmit(formValues);


            } else {
                formElement.submit();
            }
        }
    }
}