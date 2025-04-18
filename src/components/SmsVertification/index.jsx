import { useEffect } from 'react';
import { Input, notification } from 'antd';
import MaskedInput from 'react-text-mask';
import '../CardData/ObunaPay.css';

const ConfirmationCode = () => {
  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: type,
      description: message,
    });
  };

  const handleConfirm = async (code) => {
    console.log(code)
    // try {
    //   const response = await fetch(
    //     'https://xisobchiai2.admob.uz/api/v1/opt/' +
    //       localStorage.getItem('obunaPay'),
    //     {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         code: code,
    //         transaction_id: localStorage.getItem('transaction_id'),
    //       }),
    //     }
    //   );

    //   const data = await response.json();

    //   if (data.status == 200) {
    //     window.Telegram.WebApp.close();
    //   } else {
    //     openNotificationWithIcon('error', 'Boshqa kartani kiriting!');
    //   }
    // } catch (error) {
    //   console.log(error);
    //   openNotificationWithIcon(
    //     'error',
    //     "Xatolik yuz berdi, qayta urinib ko'ring!"
    //   );
    // }
  };

  const validateCode = (code) => {
    return code && code.length === 6;
  };

  const onChange = (text) => {
    console.log('onChange:', text);
  };

  const onInput = (value) => {
    console.log('onInput:', value);
  };

  const sharedProps = {
    onChange,
    onInput,
  };

  useEffect(() => {
    if (window.Telegram) {
      window.Telegram.WebApp.MainButton.setText('Tasdiqlash').show();

      window.Telegram.WebApp.MainButton.onClick(() => {
        const code = document.getElementById('code').value;
        if (validateCode(code)) {
          handleConfirm(code);
        } else if (!validateCode(code)) {
          notification.error({
            message: 'Xatolik',
            description:
              'Iltimos telefon raqamingizga borgan 6 xonali kodni kiriting!',
          });
        }
      });
      return () => {
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.MainButton.hide();
        }
      };
    }
  }, []);

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center' }} className="title">
        Tasdiqlash kodi
      </h1>
      <form>
        <Input.OTP
          id="code"
          className="custom-otp-input"
          formatter={(str) => str.toUpperCase()}
          {...sharedProps}
        />
      </form>

      <h2>Eslatmalar</h2>
      <p>
        To&apos;lovlar faqatgina UzCard va Humo kartalari orqali amalga
        oshiriladi.
      </p>

      <p className="medium">
        Xavfsizlik maqsadida sizning bank kartangiz ma&apos;lumotlari PayMe
        xizmatining serverlarida saqlanadi.
      </p>
      <p>
        Obuna xizmati sizning shaxsingizga oid hech qanday ma&apos;lumot
        saqlamaydi.
      </p>
    </div>
  );
};

export default ConfirmationCode;
