import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  IProduct,
  IProductReview,
  ProductCategory,
  ProductFilters,
  ProductsApiResponse,
  SingleProductApiResponse,
} from "@/types/product.types";
import { productService } from "@/services/productService";

// ======================================================================
// 🧱 REDUX STATE DEFINITION
// ======================================================================

export interface ProductState {
  products: IProduct[];
  singleProduct: IProduct | null;
  currentReviews: IProductReview[];
  totalProducts: number;
  filteredCount: number;
  resultsPerPage: number;
  selectedCategory: ProductCategory | "all";
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
}

const initialState: ProductState = {
  products: [],
  singleProduct: null,
  currentReviews: [],
  totalProducts: 0,
  filteredCount: 0,
  resultsPerPage: 12,
  selectedCategory: "all",
  filters: {},
  isLoading: false,
  error: null,
  mutationSuccess: false,
};

// ======================================================================
// ⚡ ASYNC THUNKS (DISPATCHABLE ACTIONS)
// ======================================================================

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(filters);
      return response;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load products.";
      return rejectWithValue(message);
    }
  }
);

export const fetchProductByIdOrSlug = createAsyncThunk(
  "products/fetchProductByIdOrSlug",
  async (idOrSlug: string, { rejectWithValue }) => {
    try {
      const response = await productService.getProductByIdOrSlug(idOrSlug);
      return response.product;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Product not found.";
      return rejectWithValue(message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await productService.deleteProduct(productId);
      return { productId, message: response.message };
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to delete product.";
      return rejectWithValue(message);
    }
  }
);

// ======================================================================
// 🎯 PRODUCT SLICE DEFINITION
// ======================================================================

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProductLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setProductError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearProductMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },

    setAllProductsData: (
      state,
      action: PayloadAction<{
        products: IProduct[];
        totalCount: number;
        filteredCount: number;
        resultsPerPage?: number;
      }>
    ) => {
      state.products = action.payload.products;
      state.totalProducts = action.payload.totalCount;
      state.filteredCount = action.payload.filteredCount;
      if (action.payload.resultsPerPage) {
        state.resultsPerPage = action.payload.resultsPerPage;
      }
      state.isLoading = false;
      state.error = null;
    },

    setSingleProductData: (state, action: PayloadAction<IProduct>) => {
      state.singleProduct = action.payload;
      state.currentReviews = action.payload.reviews || [];
      state.isLoading = false;
      state.error = null;
    },

    clearSingleProductData: (state) => {
      state.singleProduct = null;
      state.currentReviews = [];
    },

    updateProductInState: (state, action: PayloadAction<IProduct>) => {
      const updated = action.payload;
      const index = state.products.findIndex((p) => p._id === updated._id);
      if (index !== -1) {
        state.products[index] = updated;
      }
      if (state.singleProduct?._id === updated._id) {
        state.singleProduct = updated;
      }
      state.mutationSuccess = true;
    },

    deleteProductFromState: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p._id !== action.payload);
      state.totalProducts = Math.max(0, state.totalProducts - 1);
      state.filteredCount = Math.max(0, state.filteredCount - 1);
      if (state.singleProduct?._id === action.payload) {
        state.singleProduct = null;
      }
      state.mutationSuccess = true;
    },

    setSelectedCategory: (
      state,
      action: PayloadAction<ProductCategory | "all">
    ) => {
      state.selectedCategory = action.payload;
      if (action.payload === "all") {
        delete state.filters.category;
      } else {
        state.filters.category = action.payload;
      }
    },

    setProductFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetProductFilters: (state) => {
      state.filters = {};
      state.selectedCategory = "all";
    },

    setProductReviews: (state, action: PayloadAction<IProductReview[]>) => {
      state.currentReviews = action.payload;
      if (state.singleProduct) {
        state.singleProduct.reviews = action.payload;
      }
    },

    deleteReviewFromState: (state, action: PayloadAction<string>) => {
      state.currentReviews = state.currentReviews.filter(
        (rev) => rev._id !== action.payload
      );
      if (state.singleProduct) {
        state.singleProduct.reviews = state.currentReviews;
        state.singleProduct.ratingsQuantity = Math.max(
          0,
          state.singleProduct.ratingsQuantity - 1
        );
      }
      state.mutationSuccess = true;
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder.addCase(fetchProducts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchProducts.fulfilled,
      (state, action: PayloadAction<ProductsApiResponse>) => {
        state.products = action.payload.products;
        state.totalProducts = action.payload.totalCount;
        state.filteredCount = action.payload.filteredCount;
        state.resultsPerPage = action.payload.resultsPerPage;
        state.isLoading = false;
        state.error = null;
      }
    );
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || "Failed to load products.";
    });

    // fetchProductByIdOrSlug
    builder.addCase(fetchProductByIdOrSlug.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchProductByIdOrSlug.fulfilled,
      (state, action: PayloadAction<IProduct>) => {
        state.singleProduct = action.payload;
        state.currentReviews = action.payload.reviews || [];
        state.isLoading = false;
        state.error = null;
      }
    );
    builder.addCase(fetchProductByIdOrSlug.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || "Product not found.";
    });

    // deleteProduct
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      const { productId } = action.payload;
      state.products = state.products.filter((p) => p._id !== productId);
      state.totalProducts = Math.max(0, state.totalProducts - 1);
      state.filteredCount = Math.max(0, state.filteredCount - 1);
      if (state.singleProduct?._id === productId) {
        state.singleProduct = null;
      }
      state.mutationSuccess = true;
      state.isLoading = false;
    });
  },
});

export const {
  setProductLoading,
  setProductError,
  clearProductMutationFlags,
  setAllProductsData,
  setSingleProductData,
  clearSingleProductData,
  updateProductInState,
  deleteProductFromState,
  setSelectedCategory,
  setProductFilters,
  resetProductFilters,
  setProductReviews,
  deleteReviewFromState,
} = productSlice.actions;

export default productSlice.reducer;
