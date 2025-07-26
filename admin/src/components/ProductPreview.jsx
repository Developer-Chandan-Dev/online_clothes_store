import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const PreviewProduct = ({ product, onClose }) => {
  const { name, description, price, image = [] } = product;
  console.log(product);
  const MySwal = withReactContent(Swal);
  MySwal.fire({
    title: name,
    html: `
      <div style="text-align: left;">
        <strong>Description:</strong><br/> ${
          description || "No description"
        }<br/><br/>
        <strong>Price:</strong> ₹${price}<br/><br/>
        <div class="flex items-center gap-2">
        ${
          image.length > 0
            ? image
                .map(
                  (img) =>
                    `<img src="${img}" alt="Product Image" style="width: 100px; margin-right: 10px;" />`
                )
                .join("")
            : "No image"
        }
        </div>
      </div>
    `,
    width: 600,
    showCloseButton: true,
    showConfirmButton: false,
  });
};

export default PreviewProduct;
