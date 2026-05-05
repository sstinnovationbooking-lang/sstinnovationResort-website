"use client";

import { FormEvent, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function LeadForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setState("submitting");
    setMessage("");

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      checkIn: String(formData.get("checkIn") ?? "").trim(),
      checkOut: String(formData.get("checkOut") ?? "").trim(),
      guests: Number(formData.get("guests") ?? 0),
      message: String(formData.get("message") ?? "").trim()
    };

    try {
      const response = await fetch("/api/site/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as { ok?: boolean; referenceId?: string; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "ไม่สามารถส่งคำขอได้");
      }
      setState("success");
      setMessage(`ส่งคำขอสำเร็จ หมายเลขอ้างอิง: ${data.referenceId}`);
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <div className="lead-grid">
        <label>
          ชื่อผู้ติดต่อ
          <input required name="name" type="text" placeholder="ชื่อ-นามสกุล" />
        </label>
        <label>
          อีเมล
          <input name="email" type="email" placeholder="you@example.com" />
        </label>
        <label>
          เบอร์โทร
          <input name="phone" type="tel" placeholder="08x-xxx-xxxx" />
        </label>
        <label>
          จำนวนผู้เข้าพัก
          <input defaultValue={2} min={1} name="guests" type="number" />
        </label>
        <label>
          วันที่เช็กอิน
          <input name="checkIn" type="date" />
        </label>
        <label>
          วันที่เช็กเอาต์
          <input name="checkOut" type="date" />
        </label>
      </div>
      <label>
        ข้อความเพิ่มเติม
        <textarea name="message" placeholder="แจ้งรายละเอียดเพิ่มเติม..." rows={4} />
      </label>
      <button className="btn btn-primary" disabled={state === "submitting"} type="submit">
        {state === "submitting" ? "กำลังส่ง..." : "ส่งคำขอจอง"}
      </button>
      {message ? (
        <p className={state === "success" ? "lead-success" : "lead-error"} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
