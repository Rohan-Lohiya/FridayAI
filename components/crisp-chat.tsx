"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("9f8cfa5f-3303-43e2-bbe7-140b61dd30d0");
  }, []);

  return null;
};
