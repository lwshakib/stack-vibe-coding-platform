import { getGeminiModel } from "@/llm/model";
import {
  expoTemplate,
  nextJSShadcnDummyTemplate,
  nodeJSDummyTemplate,
  reactJSShadcnDummyTemplate,
} from "@/llm/templates";
import { templateToTree } from "@/utils/converter";
import { generateText } from "ai";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { guessTheTemplate } from "../../llm/template-guess";
import { protectedProcedure, router } from "../trpc";

export const appRouter = router({
  createStack: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx.auth;
    const stack = await prisma.stack.create({
      data: {
        name: "Untitled Stack",
        clerkId: userId,
      },
      select: {
        id: true,
        name: true,
        clerkId: true,
        createdAt: true,
      },
    });
    return {
      stack,
    };
  }),
  getStacks: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    const stacks = await prisma.stack.findMany({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        name: true,
        clerkId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return {
      stacks,
    };
  }),

  getStackDetails: protectedProcedure
    .input(
      z.object({
        stackId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const stack = await prisma.stack.findUnique({
        where: {
          id: input.stackId,
          clerkId: userId,
        },
      });
      return {
        stack,
      };
    }),

  deleteStack: protectedProcedure
    .input(
      z.object({
        stackId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      await prisma.stack.delete({
        where: {
          id: input.stackId,
          clerkId: userId,
        },
      });
      return {
        message: "Stack deleted successfully",
      };
    }),
  getTemplate: protectedProcedure
    .input(
      z.object({
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await guessTheTemplate(input.message);
      let files = null;
      if (result.statusCode === 200) {
        switch (result.template) {
          case "nextjs-shadcn":
            files = templateToTree(nextJSShadcnDummyTemplate);
            break;
          case "reactjs-shadcn":
            files = templateToTree(reactJSShadcnDummyTemplate);
            break;
          case "node-js":
            files = templateToTree(nodeJSDummyTemplate);
            break;
          case "expo":
            files = templateToTree(expoTemplate);
            break;
          default:
            files = null;
        }
      }

      return {
        statusCode: result.statusCode,
        template: result.template,
        reason: result.reason,
        files: files,
        updatedStackName:result.updatedStackName
      };
    }),

  updateStack: protectedProcedure
    .input(
      z.object({
        stackId: z.string(),
        files: z.any().optional(),
        template: z.string().optional(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;

      // Verify the stack belongs to the user
      const existingStack = await prisma.stack.findUnique({
        where: {
          id: input.stackId,
          clerkId: userId,
        },
      });

      if (!existingStack) {
        throw new Error("Stack not found or access denied");
      }

      // Build update data object
      const updateData: any = {};
      if (input.files !== undefined) updateData.files = input.files;
      if (input.template !== undefined) updateData.template = input.template;
      if (input.name !== undefined) updateData.name = input.name;

      // Update the stack with provided fields
      const updatedStack = await prisma.stack.update({
        where: {
          id: input.stackId,
          clerkId: userId,
        },
        data: updateData,
      });

      return {
        stack: updatedStack,
        message: "Stack updated successfully",
      };
    }),
  createMessage: protectedProcedure
    .input(
      z.object({
        stackId: z.string(),
        parts: z.any(),
        role: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      // Update the stack with provided fields
      const updatedMessage = await prisma.message.create({
        data: {
          parts: input.parts,
          role: input.role,
          stackId: input.stackId,
          clerkId: userId,
        },
      });

      return {
        data: updatedMessage,
        message: "Message created successfully",
      };
    }),

  getMessages: protectedProcedure
    .input(
      z.object({
        stackId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      // Update the stack with provided fields
      const updatedMessage = await prisma.message.findMany({
        where: {
          stackId: input.stackId,
          clerkId: userId,
        },
      });

      return {
        data: updatedMessage,
        message: "Messages fetched successfully",
      };
    }),

  enhancePrompt: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await generateText({
        model: getGeminiModel(),
        system:
          "You are an expert prompt engineer. Improve the user's prompt for a coding assistant so it is clear, specific, and actionable. Preserve the original intent, add necessary details or constraints if implied, and remove redundancy. Output only the improved prompt without any explanations, preface, quotes, or code fences.",
        prompt: input.prompt,
      });

      return {
        enhanced: response.text.trim(),
      };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
