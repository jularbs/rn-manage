import { uploadFromEditor } from "@/actions/media";
import { getCookie } from "typescript-cookie";
import { getImageSource } from "./utils";
import { toast } from "sonner";
import { InitOptions } from "@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor";

export const modules: InitOptions = {
  onboarding: false,
  icons: "thin",
  skin: "borderless",
  branding: false,
  height: 800,
  plugins: "link image code table lists advlist media autosave mediaembed wordcount searchreplace",
  default_link_target: "_blank",
  image_advtab: true,
  toolbar: [
    "styles fontsize | bold italic underline strikethrough | selectall copy paste pastetext removeformat | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | undo redo | blockquote table link image media | wordcount code searchreplace",
  ],
  file_picker_types: "image",
  images_file_types: "jpg,jpeg,webp,avif,png,gif",
  file_picker_callback: (cb: unknown, value: unknown, meta: unknown) => {
    filepickerCallback(cb, value, meta);
  },
  paste_as_text: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const filepickerCallback = (callback: any, _value: any, _meta: any) => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");

  input.onchange = function (e) {
    const target = e.target as HTMLInputElement;
    if (target && target.files) {
      const file = target.files[0];
      const reader = new FileReader();

      reader.onload = function () {
        const formData = new FormData();
        formData.append("image", file);
        const token = getCookie("token");
        const loadingToast = toast("File uploading..", {
          style: {
            background: "rgb(61, 97, 255)",
            color: "white",
          },
          description: "Please wait for file to be uploaded.",
          duration: Infinity,
        });

        uploadFromEditor({ data: formData, token: token })
          .then((data) => {
            toast.dismiss(loadingToast);
            toast.success("Success!", {
              style: {
                background: "rgb(56, 142, 60)",
                color: "white",
                border: "none",
              },
              description: "File uploaded successfully.",
              duration: 5000,
            });
            callback(getImageSource(data.data), { title: file.name });
          })
          .catch((err) => {
            toast.error("Upload failed", {
              style: {
                background: "rgba(220, 46, 46, 1)",
                color: "white",
                border: "none",
              },
              description: err.message,
              duration: 5000,
            });
          });
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Upload failed", {
        style: {
          background: "rgba(220, 46, 46, 1)",
          color: "white",
          border: "none",
        },
        description: "Invalid file input",
        duration: 5000,
      });
    }
  };

  input.click();
};
