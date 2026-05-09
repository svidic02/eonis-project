import React from "react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createOrder } from "../../services/orderService";
import classes from "./checkoutPage.module.css";
import Title from "../../components/Title/Title";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import OrderItemsList from "../../components/OrderItemsList/OrderItemsList";
export default function CheckoutPage() {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState({ ...cart });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const submit = async (data) => {
    // if (!order.addressLatLng) {
    //   toast.warning("Please select your location on the map");
    //   return;
    // }

    // setOrder({ ...order, name: data.name, address: data.address });
    // await setOrder({ ...cart, name: data.name, address: data.address });
    // if (
    //   order.items != 0 &&
    //   order.totalCount != 0 &&
    //   order.totalPrice != 0 &&
    //   order.name!==data.name &&
    //   order.address!==data.address
    // ) {

    // } else {
    //   console.log("Order is not valid.On checkout page.Order:" + order);
    //   setOrder({ ...cart, name: data.name, address: data.address });
    // }

    await createOrder({ ...order, name: data.name, address: data.address });
    navigate("/payment");
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)} className={classes.container}>
        <div className={classes.content}>
          <Title
            title="Order"
            fontSize="var(--h4-size)"
            fontWeight="var(--h3-weight)"
            color="var(--black100)"
          />
          <div className={classes.inputs}>
            <div className={classes.input_wrapper}>
              <Input
                defaultValue={user.name}
                label="Name"
                {...register("name")}
                error={errors.name}
              />
            </div>
            <div className={classes.input_wrapper}>
              <Input
                defaultValue={user.address}
                label="Address"
                {...register("address")}
                error={errors.address}
              />
            </div>
          </div>
          <div className={classes.oil_wrapper}>
            <OrderItemsList order={order} />
            <Button
              type="submit"
              text="Create this order"
              width="auto"
              height="auto"
              fontSize="var(--h4-size)"
              fontWeight="800"
            />
          </div>
        </div>
        {/* <div>
          <Title title="Choose Your Location" fontSize="1.6rem" />
          <Map
            location={order.addressLatLng}
            onChange={(latlng) => {
              console.log(latlng);
              setOrder({ ...order, addressLatLng: latlng });
            }}
          />
        </div> */}

        {/* <div className={classes.buttons_container}>
          <div className={classes.buttons}>
            
          </div>
        </div> */}
      </form>
    </>
  );
}
