import { useEffect, useState } from 'react';
import { Input, notification } from 'antd';
import '../CardData/ObunaPay.css';

const ConfirmationCode = () => {
  const [code, setCode] = useState('');

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: type,
      description: message,
    });
  };

  const handleConfirm = async (code) => {
    console.log("ishladi")
    console.log("code", code)
    try {
      const response = await fetch(
        'https://xisobchiai2.admob.uz/api/v1/opt/' +
          localStorage.getItem('obunaPay'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            transaction_id: localStorage.getItem('transaction_id'),
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        window.Telegram.WebApp.close();
      } else {
        openNotificationWithIcon('error', 'Boshqa kartani kiriting!');
      }
    } catch (error) {
      console.log(error);
      openNotificationWithIcon(
        'error',
        "Xatolik yuz berdi, qayta urinib ko'ring!"
      );
    }
  };

  const validateCode = (code) => {
    return code && code.length === 6;
  };

  useEffect(() => {
    if (window.Telegram) {
      const MainButton = window.Telegram.WebApp.MainButton;

      MainButton.setText('Tasdiqlash').show();

      const onClickHandler = () => {
        if (validateCode(code)) {
          handleConfirm(code);
        } else {
          notification.error({
            message: 'Xatolik',
            description:
              'Iltimos telefon raqamingizga borgan 6 xonali kodni kiriting!',
          });
        }
      };

      MainButton.onClick(onClickHandler);

      return () => {
        MainButton.offClick(onClickHandler);
        MainButton.hide();
      };
    }
  }, [code]); // <- code ni kuzatamiz

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center' }} className="title">
        Tasdiqlash kodi
      </h1>

      <form>
        <Input.OTP
          className="custom-otp-input"
          formatter={(str) => str.toUpperCase()}
          value={code}
          onChange={(val) => setCode(val)}
        />
      </form>

      <h2>Eslatmalar</h2>
      <p>
        To&apos;lovlar faqatgina UzCard va Humo kartalari orqali amalga oshiriladi.
      </p>
      <p className="medium">
        Xavfsizlik maqsadida sizning bank kartangiz ma&apos;lumotlari PayMe
        xizmatining serverlarida saqlanadi.
      </p>
      <p>
        Obuna xizmati sizning shaxsingizga oid hech qanday ma&apos;lumot saqlamaydi.
      </p>
    </div>
  );
};

export default ConfirmationCode;
