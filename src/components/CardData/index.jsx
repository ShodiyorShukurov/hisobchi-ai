import { useEffect } from "react";
import MaskedInput from "react-text-mask";
import { notification } from "antd";
import "./ObunaPay.css";
import { useNavigate, useParams } from "react-router-dom";

const ObunaPay = () => {
  const { id } = useParams();
  localStorage.setItem("obunaPay", id);
  const navigate = useNavigate();

  const validateCardNumber = (value) => {
    return value && value.length === 16; // Karta raqami 19 belgidan iborat bo'lishi kerak
  };

  const validateExpiryDate = (value) => {
    return value && /^(0[1-9]|1[0-2])\/(\d{2})$/.test(value); // MM/YY formatida
  };

  const validateForm = () => {
    const cardNumber = document
      .querySelector(".card-number")
      .value.replace(/[^0-9]/g, "");
    const expiryDate = document.querySelector(".card-expiry").value;

    const cardValid = validateCardNumber(cardNumber);
    const expiryValid = validateExpiryDate(expiryDate);

    if (!cardValid) {
      notification.error({
        message: "Xatolik",
        description: "Karta raqamini to'g'ri kiriting!",
      });
    }

    console.log("cardValid:" + expiryValid);
    if (!expiryValid) {
      notification.error({
        message: "Xatolik",
        description:
          "Kartangizning amal qilish muddatini to'g'ri kiriting! (MM/YY formatida)",
      });
    }

    return cardValid && expiryValid;
  };

  const handleSubmit = async () => {

    if (!validateForm()) {
      return;
    }

    const cardNumber = document
      .querySelector(".card-number")
      .value.replace(/[^0-9]/g, "");
    const expiryDate = document.querySelector(".card-expiry").value;


    try {
      const response = await fetch(
        "https://xisobchiai2.admob.uz/api/v1/add-card/" +
          localStorage.getItem("obunaPay"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            card_number: cardNumber,
            expiry: expiryDate,
          }),
        }
      );

      const data = await response.json();

      if (data.status == 400) {
        notification.error({
          message: "Xatolik",
          description: "Iltimos, nomerga ulangan kartani kiriting!",
        });
      } else if (data.status == 200) {
        localStorage.setItem("transaction_id", data.transaction_id);
        localStorage.setItem("phone", data.phone);
        navigate("/sms-verification");
      } else if (data.description == "У партнера имеется указанная карта") {
        notification.error({
          message: "Xatolik",
          description: "Bu karta oldin qo'shilgan boshqa karta kiriting!",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Xatolik",
        description: "Iltimos, boshqa karta kiriting!",
      });
    }
  };

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.MainButton.setText("Tasdiqlash").show().setAtribut;
      window.Telegram.WebApp.MainButton.onClick(() => {
        handleSubmit();
      });
    } else {
      console.log("Telegram WebApp SDK yuklanmagan");
    }

    return () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.MainButton.hide();
      }
    };
  }, []);

  return (
    <div className="container">
      <div className="form-section">
        <h1>Bank kartasi ma&apos;lumotlarini kiriting</h1>
        <form>
          <MaskedInput
            mask={[
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              " ",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              " ",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              " ",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
            ]}
            className="card-number"
            placeholder="0000 0000 0000 0000"
            required
          />
          <MaskedInput
            mask={[/\d/, /\d/, "/", /\d/, /\d/]}
            className="card-expiry"
            placeholder="MM/YY"
            required
          />
          <p>
            To&apos;lovlar faqatgina UzCard va Humo kartalari orqali amalga
            oshiriladi.
          </p>
        </form>
      </div>

      <div className="security-info">
        <p>
          Xavfsizlik maqsadida sizning bank kartangiz ma&apos;lumotlari PayMe
          xizmatining serverlarida saqlanadi.
        </p>
        <p>
          Obuna xizmati sizning shaxsingizga oid hech qanday ma&apos;lumot
          saqlamaydi.
        </p>
      </div>
    </div>
  );
};

export default ObunaPay;
